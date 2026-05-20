import re
from collections import Counter
from app.utils.text import clean_text

STOP_WORDS = set([
    "the","a","an","is","are","was","were","be","been","being","have","has","had",
    "do","does","did","will","would","could","should","may","might","shall","can",
    "not","and","or","but","in","on","at","to","for","of","with","by","from",
    "this","that","these","those","it","its","they","their","there","here","when",
    "where","which","who","what","how","why","if","then","so","as","up","out","into",
    "about","after","before","through","during","between","over","under","more","also",
    "than","other","such","just","because","while","although","however","therefore",
    "i","you","he","she","we","they","my","your","his","her","our","your","their",
])

class KeywordsService:
    def extract(self, text: str, top_n: int = 15) -> list[str]:
        if not text:
            return []
        text = clean_text(text)
        # Extract words (2+ chars, alpha)
        words = re.findall(r'\b[a-zA-Z]{3,}\b', text.lower())
        # Filter stopwords and short words
        filtered = [w for w in words if w not in STOP_WORDS and len(w) > 3]
        # Also extract 2-word phrases
        two_grams = [f"{filtered[i]} {filtered[i+1]}" for i in range(len(filtered)-1)]
        # Count
        word_counts = Counter(filtered)
        phrase_counts = Counter(two_grams)
        # Top single words
        top_words = [w for w, _ in word_counts.most_common(top_n * 2)]
        # Top phrases
        top_phrases = [p for p, c in phrase_counts.most_common(10) if c >= 2]
        # Combine, deduplicate
        result = list(dict.fromkeys(top_phrases + top_words))[:top_n]
        return result
