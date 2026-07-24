import logging
import sys
from typing import Any

_ALLOWED = {"requestId", "route", "inputMode", "status", "durationMs", "llmDurationMs", "error", "state"}


def configure_logging(level: str) -> None:
    logging.basicConfig(level=level.upper(), stream=sys.stdout, format="%(message)s")


def log_metadata(logger: logging.Logger, message: str, **fields: Any) -> None:
    safe = {key: value for key, value in fields.items() if key in _ALLOWED}
    logger.info({"event": message, **safe})
