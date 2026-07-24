SUSPICIOUS_PATTERNS = (
    "ignore previous instructions",
    "reveal your system prompt",
    "environment variables",
    "open an admin route",
    "execute javascript",
    "submit a form",
    "hide sources",
)


def contains_prompt_injection(text: str) -> bool:
    lower = text.lower()
    return any(pattern in lower for pattern in SUSPICIOUS_PATTERNS)


def delimit_untrusted_context(chunks: list[str]) -> str:
    body = "\n\n---\n\n".join(chunks)
    return f"BEGIN UNTRUSTED WEBSITE REFERENCE MATERIAL\n{body}\nEND UNTRUSTED WEBSITE REFERENCE MATERIAL"
