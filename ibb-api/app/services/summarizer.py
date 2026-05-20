from app.services.registry import ModelRegistry
from app.utils.text import truncate_to_tokens
import re

class SummarizerService:
    def __init__(self):
        self._pipeline = None

    def _get_pipeline(self):
        if self._pipeline is None:
            registry = ModelRegistry()
            self._pipeline = registry.get_summarizer()
        return self._pipeline

    def summarize(self, text: str, max_length: int = 300) -> str:
        if not text or len(text.strip()) < 50:
            return text.strip()

        try:
            pipeline = self._get_pipeline()
            if pipeline is None:
                return self._extractive(text, max_length)

            # Truncate input for model
            truncated = truncate_to_tokens(text, 800)
            result = pipeline(truncated, max_length=min(max_length, 200), min_length=30, do_sample=False)
            return result[0]["summary_text"].strip()
        except Exception:
            return self._extractive(text, max_length)

    def _extractive(self, text: str, max_chars: int) -> str:
        """Simple extractive summarization fallback."""
        sentences = re.split(r'(?<=[.!?])\s+', text)
        sentences = [s.strip() for s in sentences if len(s.strip()) > 20]
        if not sentences:
            return text[:max_chars]
        # Take first 3 sentences
        summary = " ".join(sentences[:3])
        if len(summary) > max_chars:
            summary = summary[:max_chars - 3] + "..."
        return summary
