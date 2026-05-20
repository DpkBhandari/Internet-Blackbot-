def test_semantic_search_and_index(app_client):
    r = app_client.post("/misinformation/index", json={
        "documents": [
            {"id": "d1", "text": "Solar power is the cheapest form of new electricity."},
            {"id": "d2", "text": "Coffee consumption may reduce diabetes risk."},
        ],
        "collection": "test1",
    })
    assert r.status_code == 200
    assert r.json()["indexed"] == 2

    r = app_client.post("/semantic-search", json={
        "query": "renewable energy cost",
        "top_k": 2,
        "collection": "test1",
    })
    assert r.status_code == 200
    assert len(r.json()["matches"]) >= 1


def test_misinformation_returns_claims(app_client):
    r = app_client.post("/misinformation", json={
        "text": "A new study claims that drinking 10 liters of water per day improves IQ by 50 points.",
        "max_claims": 2,
    })
    assert r.status_code == 200
    body = r.json()
    assert isinstance(body["claims"], list) and body["claims"]
    for c in body["claims"]:
        assert c["verdict"] in {"supported", "refuted", "unverified", "insufficient_evidence"}
        assert 0.0 <= c["confidence"] <= 1.0
    assert 0.0 <= body["overall_risk"] <= 1.0


def test_sources_endpoint(app_client):
    r = app_client.post("/sources", json={"query": "climate change", "limit": 3})
    assert r.status_code == 200
    items = r.json()["sources"]
    assert len(items) >= 1
    for s in items:
        assert s["url"].startswith("http")
        assert 0.0 <= s["credibility"] <= 1.0


def test_chat_grounded_response(app_client):
    r = app_client.post("/chat", json={
        "session_id": "s-test",
        "message": "What does the document say about solar energy?",
        "document": "Solar energy is now the cheapest source of new electricity globally.",
        "history": [],
    })
    assert r.status_code == 200
    body = r.json()
    assert body["session_id"] == "s-test"
    assert body["answer"]
    assert isinstance(body["citations"], list)


def test_analyze_full_pipeline(app_client):
    text = (
        "Recent reports indicate that global temperatures have risen by 1.2 degrees Celsius "
        "since the pre-industrial era. According to NASA, the past decade was the warmest on "
        "record. Renewable energy adoption has accelerated, with solar capacity doubling in "
        "five years. Researchers warn that without further action, climate impacts will worsen."
    )
    r = app_client.post("/analyze", json={"text": text, "title": "Climate brief"})
    assert r.status_code == 200
    body = r.json()
    for key in [
        "summary", "sentiment", "misinformation", "sources", "citations",
        "viral_tags", "keywords", "semantic_matches", "credibility_score",
        "confidence", "insufficient_evidence",
    ]:
        assert key in body
    assert 0.0 <= body["credibility_score"] <= 1.0
    assert 0.0 <= body["confidence"] <= 1.0
