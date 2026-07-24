def test_stream_hides_exception_traces(client) -> None:
    r = client.post("/v1/assistant/stream", json={"conversationId":"c","message":"secret user msg","inputMode":"text","unknown":1})
    assert r.status_code == 422
    assert "secret user msg" not in r.text
    assert "Traceback" not in r.text


def test_logs_do_not_contain_secrets(caplog) -> None:
    import logging

    from app.core.logging import log_metadata
    logger = logging.getLogger("test")
    log_metadata(logger, "done", requestId="r", route="/", inputMode="text", Authorization="Bearer secret", message="hello")
    assert "secret" not in caplog.text
    assert "hello" not in caplog.text
