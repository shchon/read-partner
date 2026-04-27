import { useCallback, useEffect, useState } from 'react'
import type { ConfigChangeHandler, ModelFetchStatus } from '../../lib/appState'
import { testConnectivity, toUserFacingError } from '../../lib/openai'
import type { ApiConfig } from '../../types'
import { MODEL_PAGE_SIZE, MODEL_SEARCH_THRESHOLD } from './settingsShared'

type UseModelFetchOptions = {
  apiConfig: ApiConfig
  onConfigChange: ConfigChangeHandler
}

type UseModelFetchResult = {
  availableModels: string[]
  currentModelPage: number
  filteredModels: string[]
  modelFetchMessage: string
  modelFetchStatus: ModelFetchStatus
  modelSearchTerm: string
  runModelFetch: (signal?: AbortSignal) => Promise<void>
  setModelSearchTerm: (value: string) => void
  shouldPaginateModels: boolean
  totalModelPages: number
  visibleModels: string[]
  goToNextModelPage: () => void
  goToPreviousModelPage: () => void
}

export function useModelFetch({
  apiConfig,
  onConfigChange,
}: UseModelFetchOptions): UseModelFetchResult {
  const [availableModels, setAvailableModels] = useState<string[]>([])
  const [modelFetchStatus, setModelFetchStatus] = useState<ModelFetchStatus>('idle')
  const [modelFetchMessage, setModelFetchMessage] = useState(
    '点击“测试 AI 连接”进行连通性检测。',
  )
  const [modelSearchTerm, setModelSearchTermState] = useState('')
  const [modelPage, setModelPage] = useState(1)

  const shouldPaginateModels = availableModels.length > MODEL_SEARCH_THRESHOLD
  const normalizedModelSearchTerm = modelSearchTerm.trim().toLowerCase()
  const filteredModels = availableModels.filter((model) =>
    normalizedModelSearchTerm ? model.toLowerCase().includes(normalizedModelSearchTerm) : true,
  )
  const totalModelPages = shouldPaginateModels
    ? Math.max(1, Math.ceil(filteredModels.length / MODEL_PAGE_SIZE))
    : 1
  const currentModelPage = Math.min(modelPage, totalModelPages)
  const visibleModels = shouldPaginateModels
    ? filteredModels.slice(
        (currentModelPage - 1) * MODEL_PAGE_SIZE,
        currentModelPage * MODEL_PAGE_SIZE,
      )
    : filteredModels

  const runModelFetch = useCallback(async (signal?: AbortSignal) => {
    const baseUrl = apiConfig.baseUrl.trim()
    const apiKey = apiConfig.apiKey.trim()

    if (!baseUrl || !apiKey) {
      setAvailableModels([])
      setModelPage(1)
      setModelFetchStatus('idle')
      setModelFetchMessage('点击“测试 AI 连接”进行连通性检测。')
      return
    }

    setModelFetchStatus('loading')
    setModelFetchMessage('正在测试连接...')

    try {
      await testConnectivity(apiConfig, signal)
      setModelFetchStatus('success')
      setModelFetchMessage('连接正常。')
    } catch (error) {
      if (signal?.aborted) {
        return
      }

      setAvailableModels([])
      setModelPage(1)
      setModelFetchStatus('error')
      setModelFetchMessage(toUserFacingError(error))
    }
  }, [apiConfig.apiKey, apiConfig.baseUrl, apiConfig.model, onConfigChange])

  useEffect(() => {
    // 不再自动测试连接，保持空实现，仅用于在依赖变更时重置分页或搜索逻辑（若未来需要）
  }, [])

  const setModelSearchTerm = useCallback((value: string) => {
    setModelSearchTermState(value)
    setModelPage(1)
  }, [])

  const goToPreviousModelPage = useCallback(() => {
    setModelPage((page) => Math.max(1, page - 1))
  }, [])

  const goToNextModelPage = useCallback(() => {
    setModelPage((page) => Math.min(totalModelPages, page + 1))
  }, [totalModelPages])

  return {
    availableModels,
    currentModelPage,
    filteredModels,
    modelFetchMessage,
    modelFetchStatus,
    modelSearchTerm,
    runModelFetch,
    setModelSearchTerm,
    shouldPaginateModels,
    totalModelPages,
    visibleModels,
    goToNextModelPage,
    goToPreviousModelPage,
  }
}
