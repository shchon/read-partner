
type SentenceDisplayProps = {
  text: string
}

export function SentenceDisplay({ text }: SentenceDisplayProps) {
  const handleSpeakSentence = () => {
    if (!text || !window.speechSynthesis) {
      return
    }
    window.speechSynthesis.cancel()
    const utterance = new SpeechSynthesisUtterance(text)
    window.speechSynthesis.speak(utterance)
  }

  return (
    <div className="sentence-display-container">
      <span>{text}</span>
      <button
        className="ghost-button icon-button"
        type="button"
        onClick={handleSpeakSentence}
        title="朗读句子"
        aria-label="朗读句子"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
          <path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path>
        </svg>
      </button>
    </div>
  )
}
