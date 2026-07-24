from fastapi import Request


def client_identity(request: Request) -> str:
    return request.client.host if request.client else "unknown"
