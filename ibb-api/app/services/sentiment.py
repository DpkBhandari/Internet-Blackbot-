from app.services.registry import ModelRegistry

class SentimentService:
    def __init__(self):
        self._pipeline = None

    def _get_pipeline(self):
        if self._pipeline is None:
            registry = ModelRegistry()
            self._pipeline = registry.get_sentiment()
        return self._pipeline

    def analyze(self, text: str) -> dict:
        try:
            pipeline = self._get_pipeline()
            if pipeline is None:
                return self._rule_based(text)
            result = pipeline(text[:512], truncation=True)[0]
            label = result["label"].lower()
            score = float(result["score"])
            # Normalize label
            if label in ("positive", "pos", "label_2", "2"):
                return {"label": "positive", "score": score}
            elif label in ("negative", "neg", "label_0", "0"):
                return {"label": "negative", "score": score}
            else:
                return {"label": "neutral", "score": score}
        except Exception:
            return self._rule_based(text)

    def _rule_based(self, text: str) -> dict:
        text_lower = text.lower()
        pos = sum(text_lower.count(w) for w in ["good","great","excellent","positive","success","improve","benefit","helpful","support"])
        neg = sum(text_lower.count(w) for w in ["bad","terrible","negative","fail","problem","issue","wrong","harm","danger"])
        if pos > neg * 1.5:
            return {"label": "positive", "score": 0.7}
        elif neg > pos * 1.5:
            return {"label": "negative", "score": 0.7}
        return {"label": "neutral", "score": 0.6}
