def test_health(app_client):
    r = app_client.get("/health")
    assert r.status_code == 200
    assert r.json()["status"] == "ok"


def test_requires_internal_key(app_client):
    app_client.headers.pop("x-internal-key", None)
    r = app_client.post("/sentiment", json={"text": "Hello world"})
    assert r.status_code == 401
