import numpy as np

from app.services.embeddings import cosine_matrix


def test_cosine_similarity_is_deterministic():
    rng = np.random.default_rng(0)
    a = rng.standard_normal((3, 8)).astype("float32")
    b = rng.standard_normal((4, 8)).astype("float32")
    a /= np.linalg.norm(a, axis=1, keepdims=True)
    b /= np.linalg.norm(b, axis=1, keepdims=True)
    m = cosine_matrix(a, b)
    assert m.shape == (3, 4)
    assert (m <= 1.0 + 1e-5).all() and (m >= -1.0 - 1e-5).all()


def test_vector_store_roundtrip():
    from app.services.vector_store import get_store
    store = get_store()
    vecs = np.eye(3, dtype="float32")
    store.add("t1", ids=["a", "b", "c"], vectors=vecs,
              texts=["alpha", "beta", "gamma"], metadata=[{}, {}, {}])
    res = store.search("t1", vecs[1], top_k=2)
    assert res[0][0] == "b"
    assert res[0][2] > 0.99
