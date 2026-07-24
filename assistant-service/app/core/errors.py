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
    KNOWLEDGE_NOT_CONFIGURED = "KNOWLEDGE_NOT_CONFIGURED"
    KNOWLEDGE_SOURCE_UNAVAILABLE = "KNOWLEDGE_SOURCE_UNAVAILABLE"
    KNOWLEDGE_FETCH_TIMEOUT = "KNOWLEDGE_FETCH_TIMEOUT"
    KNOWLEDGE_INVALID_CONTENT = "KNOWLEDGE_INVALID_CONTENT"
    EMBEDDING_UNAVAILABLE = "EMBEDDING_UNAVAILABLE"
    EMBEDDING_TIMEOUT = "EMBEDDING_TIMEOUT"
    EMBEDDING_INVALID_RESPONSE = "EMBEDDING_INVALID_RESPONSE"
    QDRANT_UNAVAILABLE = "QDRANT_UNAVAILABLE"
    QDRANT_TIMEOUT = "QDRANT_TIMEOUT"
    QDRANT_INVALID_RESPONSE = "QDRANT_INVALID_RESPONSE"
    INDEX_AUTHENTICATION_FAILED = "INDEX_AUTHENTICATION_FAILED"
    INDEX_PARTIAL_FAILURE = "INDEX_PARTIAL_FAILURE"
    RETRIEVAL_NO_MATCH = "RETRIEVAL_NO_MATCH"
    RETRIEVAL_CANCELLED = "RETRIEVAL_CANCELLED"
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
    ErrorCode.KNOWLEDGE_NOT_CONFIGURED: "Website knowledge is not configured.",
    ErrorCode.KNOWLEDGE_SOURCE_UNAVAILABLE: "Website knowledge sources are temporarily unavailable.",
    ErrorCode.KNOWLEDGE_FETCH_TIMEOUT: "Website knowledge fetching timed out.",
    ErrorCode.KNOWLEDGE_INVALID_CONTENT: "Website knowledge content could not be processed safely.",
    ErrorCode.EMBEDDING_UNAVAILABLE: "The local embedding service is unavailable.",
    ErrorCode.EMBEDDING_TIMEOUT: "The local embedding request timed out.",
    ErrorCode.EMBEDDING_INVALID_RESPONSE: "The local embedding service returned an invalid response.",
    ErrorCode.QDRANT_UNAVAILABLE: "The local vector store is unavailable.",
    ErrorCode.QDRANT_TIMEOUT: "The local vector store request timed out.",
    ErrorCode.QDRANT_INVALID_RESPONSE: "The local vector store returned an invalid response.",
    ErrorCode.INDEX_AUTHENTICATION_FAILED: "Knowledge indexing authentication failed.",
    ErrorCode.INDEX_PARTIAL_FAILURE: "Knowledge indexing completed with partial failures.",
    ErrorCode.RETRIEVAL_NO_MATCH: "No verified website knowledge matched the request.",
    ErrorCode.RETRIEVAL_CANCELLED: "Website knowledge retrieval was cancelled.",
    ErrorCode.INTERNAL_ERROR: "The assistant encountered an internal error.",
}

RETRYABLE: set[ErrorCode] = {
    ErrorCode.LLM_UNAVAILABLE,
    ErrorCode.LLM_TIMEOUT,
    ErrorCode.LLM_RATE_LIMITED,
    ErrorCode.LLM_CANCELLED,
    ErrorCode.RATE_LIMITED,
    ErrorCode.CONCURRENCY_LIMITED,
    ErrorCode.KNOWLEDGE_SOURCE_UNAVAILABLE,
    ErrorCode.KNOWLEDGE_FETCH_TIMEOUT,
    ErrorCode.EMBEDDING_UNAVAILABLE,
    ErrorCode.EMBEDDING_TIMEOUT,
    ErrorCode.QDRANT_UNAVAILABLE,
    ErrorCode.QDRANT_TIMEOUT,
    ErrorCode.INDEX_PARTIAL_FAILURE,
    ErrorCode.RETRIEVAL_CANCELLED,
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
