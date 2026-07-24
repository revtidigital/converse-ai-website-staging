import re
import unicodedata

BOILERPLATE = {"whatsapp", "cookie", "privacy preferences", "all rights reserved"}


def clean_text(text: str, *, max_characters: int = 100000) -> str:
    text = unicodedata.normalize("NFKC", text)
    text = re.sub(r"[\x00-\x08\x0b\x0c\x0e-\x1f\x7f]", " ", text)
    paragraphs: list[str] = []
    seen: set[str] = set()
    for raw in re.split(r"\n{2,}|\r\n", text):
        paragraph = re.sub(r"\s+", " ", raw).strip()
        if not paragraph:
            continue
        lower = paragraph.lower()
        if any(marker in lower and len(paragraph) < 120 for marker in BOILERPLATE):
            continue
        key = lower
        if key in seen:
            continue
        seen.add(key)
        paragraphs.append(paragraph)
    cleaned = "\n\n".join(paragraphs)
    if not cleaned or len(cleaned) > max_characters:
        raise ValueError("invalid cleaned content")
    return cleaned
