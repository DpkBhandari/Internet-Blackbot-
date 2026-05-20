from __future__ import annotations

from typing import Any, Dict, List, Optional

from pydantic import BaseModel, Field


class TextIn(BaseModel):
    text: str = Field(..., min_length=1, max_length=200_000)


class SentimentOut(BaseModel):
    label: str
    score: float
    distribution: Dict[str, float]


class ToxicityOut(BaseModel):
    label: str
    score: float
    categories: Dict[str, float]


class SummaryIn(BaseModel):
    text: str = Field(..., min_length=20)
    max_length: int = 200
    min_length: int = 60


class SummaryOut(BaseModel):
    summary: str


class KeywordsOut(BaseModel):
    keywords: List[str]
    tags: List[str]


class Source(BaseModel):
    title: str
    url: str
    snippet: str
    source: str               # serpapi | newsapi | semantic_scholar
    published_at: Optional[str] = None
    credibility: float = 0.0
    similarity: float = 0.0


class SourcesIn(BaseModel):
    query: str
    limit: int = 8


class SourcesOut(BaseModel):
    sources: List[Source]


class Claim(BaseModel):
    text: str
    verdict: str              # supported | refuted | unverified | insufficient_evidence
    confidence: float
    evidence: List[Source]


class MisinfoIn(BaseModel):
    text: str
    max_claims: int = 5


class MisinfoOut(BaseModel):
    claims: List[Claim]
    overall_risk: float       # 0..1


class SemanticSearchIn(BaseModel):
    query: str
    top_k: int = 5
    collection: str = "default"


class SemanticMatch(BaseModel):
    id: str
    text: str
    score: float
    metadata: Dict[str, Any] = {}


class SemanticSearchOut(BaseModel):
    matches: List[SemanticMatch]


class IndexIn(BaseModel):
    documents: List[Dict[str, Any]]
    collection: str = "default"


class IndexOut(BaseModel):
    indexed: int
    collection: str


class RecommendationsIn(BaseModel):
    text: str
    limit: int = 5


class RecommendationsOut(BaseModel):
    recommendations: List[Source]


class ChatMessage(BaseModel):
    role: str
    content: str


class ChatIn(BaseModel):
    session_id: str
    message: str
    document: Optional[str] = None
    history: List[ChatMessage] = []


class Citation(BaseModel):
    index: int
    url: str
    title: str
    snippet: str


class ChatOut(BaseModel):
    answer: str
    citations: List[Citation]
    session_id: str


class AnalyzeIn(BaseModel):
    text: str = Field(..., min_length=50)
    title: Optional[str] = None
    max_claims: int = 5
    max_sources_per_claim: int = 4


class AnalyzeOut(BaseModel):
    summary: str
    sentiment: SentimentOut
    misinformation: MisinfoOut
    sources: List[Source]
    citations: List[Citation]
    viral_tags: List[str]
    keywords: List[str]
    semantic_matches: List[SemanticMatch]
    credibility_score: float
    confidence: float
    insufficient_evidence: bool = False
