import re
import unicodedata

def clean_text(text: str) -> str:
    if not text:
        return ""
    # Normalize unicode
    text = unicodedata.normalize("NFKC", text)
    # Remove excessive whitespace
    text = re.sub(r'\n{3,}', '\n\n', text)
    text = re.sub(r' {3,}', ' ', text)
    # Remove null bytes and control chars
    text = re.sub(r'[\x00-\x08\x0b\x0c\x0e-\x1f\x7f]', '', text)
    return text.strip()

def extract_claims(text: str) -> list[str]:
    """Extract sentences that look like verifiable claims."""
    sentences = re.split(r'(?<=[.!?])\s+', text)
    claims = []
    indicators = [
        r'\b(claims?|alleges?|asserts?|states?|reports?|says?|argues?|contends?)\b',
        r'\b(is|are|was|were|will be|has been)\b.*\b(the (most|best|worst|first|only))\b',
        r'\b\d+\s*(percent|%|million|billion|thousand)\b',
        r'\b(always|never|all|none|every|no one|everyone)\b',
        r'\b(proven?|confirmed?|verified?|debunked?|false|true|fact)\b',
    ]
    for sent in sentences:
        sent = sent.strip()
        if len(sent) < 20 or len(sent) > 300:
            continue
        for pattern in indicators:
            if re.search(pattern, sent, re.IGNORECASE):
                claims.append(sent)
                break
    return claims[:15]

def chunk_text(text: str, chunk_size: int = 512, overlap: int = 50) -> list[str]:
    words = text.split()
    chunks = []
    for i in range(0, len(words), chunk_size - overlap):
        chunk = " ".join(words[i:i + chunk_size])
        chunks.append(chunk)
    return chunks

def truncate_to_tokens(text: str, max_tokens: int = 512) -> str:
    words = text.split()
    if len(words) <= max_tokens:
        return text
    return " ".join(words[:max_tokens])
