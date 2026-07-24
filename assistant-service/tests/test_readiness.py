from app.api.dependencies import llm_client_dependency
from app.core.errors import AssistantError, ErrorCode
from app.main import app
from tests.conftest import FakeLLM


def test_ready_with_mocked_llm(client) -> None:
    r = client.get("/health/ready")
    assert r.status_code == 200
    assert r.json()["dependencies"]["llm"] == "available"


def test_ready_fails_safely(client) -> None:
    app.dependency_overrides[llm_client_dependency] = lambda: FakeLLM(fail=AssistantError(ErrorCode.LLM_UNAVAILABLE))
    r = client.get("/health/ready")
    assert r.status_code == 503
    text = r.text
    assert "unavailable" in text
    assert "Traceback" not in text and "Authorization" not in text
