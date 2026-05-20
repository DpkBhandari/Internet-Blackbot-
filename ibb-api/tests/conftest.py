"""Shared fixtures. Heavy ML models are mocked so the suite runs in seconds
and works offline. Real-model behaviour is exercised in integration tests
(skipped by default — set RUN_INTEGRATION=1)."""
from __future__ import annotations

import os
import sys
import types

import numpy as np
import pytest

os.environ.setdefault("INTERNAL_API_KEY", "test-key")
os.environ.setdefault("REDIS_URL", "redis://localhost:6379/15")


class FakeEmbedder:
    def __init__(self, dim: int = 32):
        self._dim = dim

    def get_sentence_embedding_dimension(self) -> int:
        return self._dim

    def encode(self, texts, **kwargs):
        rng = np.random.default_rng(42)
        vecs = []
        for t in texts:
            seed = abs(hash(t)) % (2**32)
            local = np.random.default_rng(seed)
            v = local.standard_normal(self._dim).astype("float32")
            v /= np.linalg.norm(v) + 1e-9
            vecs.append(v)
        return np.vstack(vecs)


class FakePipeline:
    def __init__(self, kind: str):
        self.kind = kind

    def __call__(self, text, **kwargs):
        if self.kind == "sentiment":
            return [[
                {"label": "positive", "score": 0.6},
                {"label": "neutral", "score": 0.3},
                {"label": "negative", "score": 0.1},
            ]]
        if self.kind == "toxicity":
            return [[
                {"label": "toxic", "score": 0.1},
                {"label": "obscene", "score": 0.05},
            ]]
        if self.kind == "summarizer":
            return [{"summary_text": (text if isinstance(text, str) else "")[:120] + "..."}]
        if self.kind == "nli":
            return [[
                {"label": "entailment", "score": 0.7},
                {"label": "neutral", "score": 0.2},
                {"label": "contradiction", "score": 0.1},
            ]]
        if self.kind == "chat":
            return [{"generated_text": "Based on the evidence, the answer references [S1]."}]
        return [{"label": "ok", "score": 1.0}]


class FakeKeyBERT:
    def extract_keywords(self, text, **kwargs):
        words = [w.strip(".,!?") for w in text.split() if len(w) > 4]
        seen, out = set(), []
        for w in words:
            wl = w.lower()
            if wl in seen:
                continue
            seen.add(wl)
            out.append((wl, 0.5))
            if len(out) >= kwargs.get("top_n", 10):
                break
        return out


class FakeRegistry:
    def __init__(self):
        self._emb = FakeEmbedder()
        self._pipes = {}

    def embedder(self): return self._emb
    def sentiment(self): return self._pipes.setdefault("s", FakePipeline("sentiment"))
    def toxicity(self): return self._pipes.setdefault("t", FakePipeline("toxicity"))
    def summarizer(self): return self._pipes.setdefault("sm", FakePipeline("summarizer"))
    def nli(self): return self._pipes.setdefault("n", FakePipeline("nli"))
    def chat(self): return self._pipes.setdefault("c", FakePipeline("chat"))
    def keybert(self): return FakeKeyBERT()
    def warmup(self): pass


@pytest.fixture
def fake_models():
    return FakeRegistry()


@pytest.fixture
def app_client(monkeypatch, fake_models):
    """FastAPI test client with model registry + research mocked."""
    from fastapi.testclient import TestClient

    import app.services.research as research
    async def fake_search(query, limit=8):
        from app.schemas.models import Source
        return [
            Source(title=f"Result {i} for {query[:20]}", url=f"https://example.com/{i}",
                   snippet=f"Snippet about {query}", source="serpapi", credibility=0.7)
            for i in range(min(limit, 3))
        ]
    monkeypatch.setattr(research, "search_sources", fake_search)
    # also patch in modules that imported the symbol directly
    import app.services.pipeline as pl
    import app.services.chat as chat_mod
    import app.api.recommendations as recs
    import app.api.misinformation as misinfo
    monkeypatch.setattr(pl, "search_sources", fake_search)
    monkeypatch.setattr(chat_mod, "search_sources", fake_search)
    monkeypatch.setattr(recs, "search_sources", fake_search)
    monkeypatch.setattr(misinfo, "search_sources", fake_search)

    from app.main import app
    app.state.models = fake_models
    with TestClient(app) as client:
        client.headers.update({"x-internal-key": os.environ["INTERNAL_API_KEY"]})
        yield client
