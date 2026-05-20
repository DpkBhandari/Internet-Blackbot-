from __future__ import annotations

from typing import List, Sequence

import numpy as np

from app.core.redis_client import cache_get, cache_set
from app.utils.text import hash_key


async def embed_texts(embedder, texts: Sequence[str], use_cache: bool = True) -> np.ndarray:
    if not texts:
        return np.zeros((0, embedder.get_sentence_embedding_dimension()), dtype="float32")

    vectors: List[np.ndarray] = [None] * len(texts)  # type: ignore
    missing: list[tuple[int, str]] = []

    if use_cache:
        for i, t in enumerate(texts):
            cached = await cache_get(f"emb:{hash_key(t)}")
            if cached is not None:
                vectors[i] = np.asarray(cached, dtype="float32")
            else:
                missing.append((i, t))
    else:
        missing = list(enumerate(texts))

    if missing:
        encoded = embedder.encode(
            [t for _, t in missing],
            convert_to_numpy=True,
            normalize_embeddings=True,
            show_progress_bar=False,
        ).astype("float32")
        for (idx, text), vec in zip(missing, encoded):
            vectors[idx] = vec
            if use_cache:
                await cache_set(f"emb:{hash_key(text)}", vec.tolist(), ttl=86400)

    return np.vstack(vectors)


def cosine_matrix(a: np.ndarray, b: np.ndarray) -> np.ndarray:
    """Inputs assumed L2-normalized."""
    if a.size == 0 or b.size == 0:
        return np.zeros((a.shape[0], b.shape[0]), dtype="float32")
    return a @ b.T
