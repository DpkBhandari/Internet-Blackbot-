import asyncio
from typing import Optional
from app.services.sentiment import SentimentService
from app.services.summarizer import SummarizerService
from app.services.keywords import KeywordsService
from app.services.toxicity import ToxicityService
from app.utils.text import extract_claims, clean_text

class AnalysisPipeline:
    def __init__(self):
        self._sentiment = None
        self._summarizer = None
        self._keywords = None
        self._toxicity = None

    def _get_sentiment(self):
        if not self._sentiment:
            self._sentiment = SentimentService()
        return self._sentiment

    def _get_summarizer(self):
        if not self._summarizer:
            self._summarizer = SummarizerService()
        return self._summarizer

    def _get_keywords(self):
        if not self._keywords:
            self._keywords = KeywordsService()
        return self._keywords

    def _get_toxicity(self):
        if not self._toxicity:
            self._toxicity = ToxicityService()
        return self._toxicity

    async def run(self, text: str, topic: str = "", title: str = "") -> dict:
        text = clean_text(text)
        if not text:
            return self._empty_result()

        # Truncate for processing
        proc_text = text[:8000]

        results = {}

        # Run concurrently where possible
        try:
            sentiment_result = self._get_sentiment().analyze(proc_text)
            results["sentiment"] = sentiment_result
        except Exception as e:
            results["sentiment"] = {"label": "neutral", "score": 0.5, "error": str(e)}

        try:
            summary = self._get_summarizer().summarize(proc_text)
            results["summary"] = summary
        except Exception as e:
            results["summary"] = text[:300] + "..." if len(text) > 300 else text

        try:
            kw = self._get_keywords().extract(proc_text)
            results["keywords"] = kw
        except Exception as e:
            results["keywords"] = []

        try:
            tox = self._get_toxicity().analyze(proc_text[:2000])
            results["toxicity"] = tox
        except Exception as e:
            results["toxicity"] = {"label": "non-toxic", "score": 0.1}

        # Extract claims for misinformation
        claims = extract_claims(text)
        results["claims"] = [{"text": c, "verdict": "UNVERIFIED", "confidence": 0.5} for c in claims[:10]]

        # Aggregate scores
        tox_score = results.get("toxicity", {}).get("score", 0.1)
        neg_score = 1 - results.get("sentiment", {}).get("score", 0.5) if results.get("sentiment", {}).get("label") == "negative" else 0.1
        results["misinformationScore"] = round(min(1.0, (tox_score * 0.5 + neg_score * 0.3 + 0.1)), 3)
        results["credibilityScore"] = round(max(0.1, 1.0 - results["misinformationScore"]), 3)
        results["metrics"] = {
            "wordCount": len(text.split()),
            "sentenceCount": text.count(".") + text.count("!") + text.count("?"),
            "keywordCount": len(results.get("keywords", [])),
            "claimCount": len(results["claims"]),
        }

        return results

    def _empty_result(self):
        return {
            "summary": "", "sentiment": {"label": "neutral", "score": 0.5},
            "keywords": [], "toxicity": {"label": "non-toxic", "score": 0.0},
            "claims": [], "misinformationScore": 0.0, "credibilityScore": 1.0,
            "metrics": {"wordCount": 0, "sentenceCount": 0, "keywordCount": 0, "claimCount": 0},
        }
