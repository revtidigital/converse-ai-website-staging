from enum import StrEnum


class ErrorCode(StrEnum):
    LLM_UNAVAILABLE = "LLM_UNAVAILABLE"
    LLM_TIMEOUT = "LLM_TIMEOUT"
    LLM_INVALID_RESPONSE = "LLM_INVALID_RESPONSE"
    LLM_RATE_LIMITED = "LLM_RATE_LIMITED"
    LLM_AUTHENTICATION_FAILED = "LLM_AUTHENTICATION_FAILED"
    LLM_REQUEST_REJECTED = "LLM_REQUEST_REJECTED"
    LLM_CANCELLED = "LLM_CANCELLED"
    RATE_LIMITED = "RATE_LIMITED"
    CONCURRENCY_LIMITED = "CONCURRENCY_LIMITED"
    INTERNAL_ERROR = "INTERNAL_ERROR"


SAFE_MESSAGES: dict[ErrorCode, str] = {
    ErrorCode.LLM_UNAVAILABLE: "The assistant is temporarily unavailable.",
    ErrorCode.LLM_TIMEOUT: "The assistant request timed out.",
    ErrorCode.LLM_INVALID_RESPONSE: "The assistant received an invalid local model response.",
    ErrorCode.LLM_RATE_LIMITED: "The local model server is rate limited.",
    ErrorCode.LLM_AUTHENTICATION_FAILED: "The local model server rejected authentication.",
    ErrorCode.LLM_REQUEST_REJECTED: "The local model server rejected the request.",
    ErrorCode.LLM_CANCELLED: "The assistant request was cancelled.",
    ErrorCode.RATE_LIMITED: "Too many assistant requests. Please try again shortly.",
    ErrorCode.CONCURRENCY_LIMITED: "The assistant is busy. Please try again shortly.",
    ErrorCode.INTERNAL_ERROR: "The assistant encountered an internal error.",
}

RETRYABLE: set[ErrorCode] = {
    ErrorCode.LLM_UNAVAILABLE,
    ErrorCode.LLM_TIMEOUT,
    ErrorCode.LLM_RATE_LIMITED,
    ErrorCode.LLM_CANCELLED,
    ErrorCode.RATE_LIMITED,
    ErrorCode.CONCURRENCY_LIMITED,
    ErrorCode.INTERNAL_ERROR,
}


class AssistantError(Exception):
    def __init__(self, code: ErrorCode) -> None:
        super().__init__(code.value)
        self.code = code

    @property
    def safe_message(self) -> str:
        return SAFE_MESSAGES[self.code]

    @property
    def retryable(self) -> bool:
        return self.code in RETRYABLE
