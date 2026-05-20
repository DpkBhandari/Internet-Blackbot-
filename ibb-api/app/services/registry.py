import logging
from typing import Optional

logger = logging.getLogger(__name__)

class ModelRegistry:
    _instance = None
    _sentiment_pipeline = None
    _summarizer_pipeline = None
    _zero_shot_pipeline = None
    _initialized = False

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super().__new__(cls)
        return cls._instance

    def initialize(self):
        if self._initialized:
            return
        logger.info("Initializing AI model registry...")
        # Models load lazily to avoid startup failures
        self._initialized = True
        logger.info("Model registry ready (lazy loading enabled)")

    def get_sentiment(self):
        if self._sentiment_pipeline is not None:
            return self._sentiment_pipeline
        try:
            from transformers import pipeline
            self._sentiment_pipeline = pipeline(
                "sentiment-analysis",
                model="distilbert-base-uncased-finetuned-sst-2-english",
                truncation=True, max_length=512,
            )
            logger.info("Sentiment model loaded")
        except Exception as e:
            logger.warning(f"Sentiment model failed to load: {e}")
            self._sentiment_pipeline = None
        return self._sentiment_pipeline

    def get_summarizer(self):
        if self._summarizer_pipeline is not None:
            return self._summarizer_pipeline
        try:
            from transformers import pipeline
            self._summarizer_pipeline = pipeline(
                "summarization",
                model="sshleifer/distilbart-cnn-12-6",
                truncation=True,
            )
            logger.info("Summarizer model loaded")
        except Exception as e:
            logger.warning(f"Summarizer model failed to load: {e}")
            self._summarizer_pipeline = None
        return self._summarizer_pipeline

    def get_zero_shot(self):
        if self._zero_shot_pipeline is not None:
            return self._zero_shot_pipeline
        try:
            from transformers import pipeline
            self._zero_shot_pipeline = pipeline("zero-shot-classification", model="facebook/bart-large-mnli")
            logger.info("Zero-shot model loaded")
        except Exception as e:
            logger.warning(f"Zero-shot model failed to load: {e}")
            self._zero_shot_pipeline = None
        return self._zero_shot_pipeline
