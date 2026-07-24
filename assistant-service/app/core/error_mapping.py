from app.core.errors import ErrorCode


def status_for_error(code: ErrorCode) -> int:
    if code in {ErrorCode.RATE_LIMITED, ErrorCode.LLM_RATE_LIMITED}:
        return 429
    if code == ErrorCode.CONCURRENCY_LIMITED:
        return 503
    if code == ErrorCode.LLM_TIMEOUT:
        return 504
    if code in {ErrorCode.LLM_AUTHENTICATION_FAILED, ErrorCode.LLM_REQUEST_REJECTED}:
        return 502
    return 503
