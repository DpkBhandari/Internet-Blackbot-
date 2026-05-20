def test_sentiment(app_client):
    r = app_client.post("/sentiment", json={"text": "I love this product, it's amazing."})
    assert r.status_code == 200
    body = r.json()
    assert body["label"] in {"positive", "negative", "neutral"}
    assert 0.0 <= body["score"] <= 1.0
    assert set(body["distribution"].keys()) >= {"positive"}


def test_toxicity(app_client):
    r = app_client.post("/toxicity", json={"text": "Have a nice day everyone."})
    assert r.status_code == 200
    body = r.json()
    assert "score" in body and "categories" in body


def test_keywords(app_client):
    r = app_client.post("/keywords", json={
        "text": "Climate change accelerates Arctic melting according to NASA satellite research."
    })
    assert r.status_code == 200
    body = r.json()
    assert isinstance(body["keywords"], list) and body["keywords"]
    assert all(t.startswith("#") for t in body["tags"])


def test_summary(app_client):
    text = "Lorem ipsum dolor sit amet. " * 30
    r = app_client.post("/summary", json={"text": text, "max_length": 80, "min_length": 20})
    assert r.status_code == 200
    assert r.json()["summary"]
