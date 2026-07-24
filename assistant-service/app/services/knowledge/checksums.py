import hashlib
import json
from typing import Any


def normalized_checksum(value: str) -> str:
    normalized = " ".join(value.split())
    return hashlib.sha256(normalized.encode("utf-8")).hexdigest()


def object_checksum(value: Any) -> str:
    return hashlib.sha256(json.dumps(value, sort_keys=True, default=str).encode("utf-8")).hexdigest()
