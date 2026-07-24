def test_health_returns_200_and_does_not_call_llm(client, fake_llm) -> None:
    r = client.get("/health")
    assert r.status_code == 200
    assert r.json() == {"status":"ok","service":"converse-assistant","version":"0.1.0"}
    assert fake_llm.generate_calls == 0
