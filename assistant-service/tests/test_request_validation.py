import pytest
from pydantic import ValidationError

from app.models.requests import AssistantTurnRequest


def valid_payload(**kw):
    data = {"conversationId":" c1 ","message":" hi ","inputMode":"text","currentRoute":"/"}
    data.update(kw)
    return data


def test_valid_text_and_voice() -> None:
    assert AssistantTurnRequest.model_validate(valid_payload()).message == "hi"
    assert AssistantTurnRequest.model_validate(valid_payload(inputMode="voice")).inputMode == "voice"


@pytest.mark.parametrize("kw", [
    {"message":""}, {"message":"   "}, {"message":"x"*11}, {"inputMode":"bad"},
    {"currentRoute":"https://evil.test"}, {"currentRoute":"javascript:alert(1)"}, {"extra":1},
])
def test_invalid_payloads(kw) -> None:
    with pytest.raises(ValidationError):
        AssistantTurnRequest.model_validate(valid_payload(**kw), context={"max_message_length":10})


def test_oversized_context_and_memory() -> None:
    with pytest.raises(ValidationError):
        AssistantTurnRequest.model_validate(valid_payload(currentPageContext={"visibleText":"x"*100}), context={"max_context_length":20})
    with pytest.raises(ValidationError):
        AssistantTurnRequest.model_validate(valid_payload(conversationMemory={"summary":"x"*100}), context={"max_memory_length":20})
