def test_streaming_sse_success(client) -> None:
    r = client.post("/v1/assistant/stream", json={"conversationId":"c","message":"hi","inputMode":"text"})
    assert r.status_code == 200
    assert r.headers["content-type"].startswith("text/event-stream")
    assert "response.started" in r.text
    assert "response.delta" in r.text
    assert "response.completed" in r.text
