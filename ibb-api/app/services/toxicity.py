import re

TOXIC_PATTERNS = [
    r'\b(hate|kill|destroy|violent|attack|threaten|abuse|harass)\b',
    r'\b(racist|sexist|bigot|discriminat)\b',
    r'\b(fuck|shit|ass|bastard|bitch|damn)\b',
]

class ToxicityService:
    def __init__(self):
        self._pipeline = None

    def _get_pipeline(self):
        if self._pipeline is not None:
            return self._pipeline
        try:
            from transformers import pipeline
            self._pipeline = pipeline(
                "text-classification",
                model="unitary/toxic-bert",
                truncation=True, max_length=512,
            )
        except Exception:
            self._pipeline = None
        return self._pipeline

    def analyze(self, text: str) -> dict:
        try:
            pipeline = self._get_pipeline()
            if pipeline:
                result = pipeline(text[:512], truncation=True)[0]
                return {"label": result["label"].lower(), "score": float(result["score"])}
        except Exception:
            pass
        # Rule-based fallback
        return self._rule_based(text)

    def _rule_based(self, text: str) -> dict:
        matches = sum(1 for p in TOXIC_PATTERNS if re.search(p, text, re.IGNORECASE))
        score = min(1.0, matches * 0.2)
        label = "toxic" if score > 0.5 else "non-toxic"
        return {"label": label, "score": score}
