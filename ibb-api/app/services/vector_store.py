"""Pluggable vector store — FAISS in-memory or ChromaDB persistent.

Collections are isolated namespaces. All vectors are L2-normalized so inner
product equals cosine similarity."""
from __future__ import annotations

import threading
from typing import Any, Dict, List, Tuple

import numpy as np

from app.core.config import settings


class _FaissCollection:
    def __init__(self, dim: int) -> None:
        import faiss
        self.dim = dim
        self.index = faiss.IndexFlatIP(dim)
        self.ids: List[str] = []
        self.texts: List[str] = []
        self.meta: List[Dict[str, Any]] = []

    def add(self, ids: List[str], vectors: np.ndarray, texts: List[str], meta: List[Dict[str, Any]]) -> None:
        self.index.add(vectors.astype("float32"))
        self.ids.extend(ids)
        self.texts.extend(texts)
        self.meta.extend(meta)

    def search(self, vector: np.ndarray, top_k: int) -> List[Tuple[str, str, float, Dict[str, Any]]]:
        if self.index.ntotal == 0:
            return []
        k = min(top_k, self.index.ntotal)
        scores, idxs = self.index.search(vector.reshape(1, -1).astype("float32"), k)
        out: list[tuple[str, str, float, dict]] = []
        for score, i in zip(scores[0], idxs[0]):
            if i < 0:
                continue
            out.append((self.ids[i], self.texts[i], float(score), self.meta[i]))
        return out


class VectorStore:
    def __init__(self) -> None:
        self._lock = threading.Lock()
        self._faiss: Dict[str, _FaissCollection] = {}
        self._chroma_client = None
        if settings.vector_backend == "chroma":
            import chromadb
            self._chroma_client = chromadb.PersistentClient(path=settings.chroma_dir)

    # -----------------------------------------------------------------
    def add(self, collection: str, ids: List[str], vectors: np.ndarray,
            texts: List[str], metadata: List[Dict[str, Any]]) -> None:
        if settings.vector_backend == "chroma":
            col = self._chroma_client.get_or_create_collection(collection)
            col.upsert(ids=ids, embeddings=vectors.tolist(), documents=texts, metadatas=metadata)
            return
        with self._lock:
            col = self._faiss.get(collection)
            if col is None:
                col = _FaissCollection(vectors.shape[1])
                self._faiss[collection] = col
            col.add(ids, vectors, texts, metadata)

    def search(self, collection: str, vector: np.ndarray, top_k: int = 5
               ) -> List[Tuple[str, str, float, Dict[str, Any]]]:
        if settings.vector_backend == "chroma":
            col = self._chroma_client.get_or_create_collection(collection)
            res = col.query(query_embeddings=[vector.tolist()], n_results=top_k)
            ids = res.get("ids", [[]])[0]
            docs = res.get("documents", [[]])[0]
            dists = res.get("distances", [[]])[0]
            metas = res.get("metadatas", [[]])[0]
            # chroma returns L2 distances when using default; convert to similarity
            return [
                (i, d, max(0.0, 1.0 - float(dist)), m or {})
                for i, d, dist, m in zip(ids, docs, dists, metas)
            ]
        with self._lock:
            col = self._faiss.get(collection)
            if col is None:
                return []
            return col.search(vector, top_k)


_store: VectorStore | None = None


def get_store() -> VectorStore:
    global _store
    if _store is None:
        _store = VectorStore()
    return _store
