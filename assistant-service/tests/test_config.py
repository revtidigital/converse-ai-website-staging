import pytest
from pydantic import ValidationError

from app.config import Settings


def test_valid_settings_and_empty_key() -> None:
    s = Settings(LLM_BASE_URL=" http://127.0.0.1:8080/v1 ", LLM_API_KEY="")
    assert s.llm_base_url == "http://127.0.0.1:8080/v1"
    assert s.api_key_value() is None


@pytest.mark.parametrize("kwargs", [
    {"LLM_BASE_URL":"not-a-url"},
    {"LLM_REQUEST_TIMEOUT_SECONDS":0},
    {"RATE_LIMIT_REQUESTS":-1},
    {"ALLOWED_ORIGINS":"*"},
])
def test_invalid_settings(kwargs: dict[str, object]) -> None:
    with pytest.raises(ValidationError):
        Settings(**kwargs)


def test_secret_not_in_repr() -> None:
    assert "secret" not in repr(Settings(LLM_API_KEY="secret"))
