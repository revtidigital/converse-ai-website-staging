import json
import os
import tempfile
from pathlib import Path

from app.services.knowledge.models import IndexedSourceManifest


class JsonIndexManifestStore:
    def __init__(self, path: Path) -> None:
        self.path = path
        self._items: dict[str, IndexedSourceManifest] = {}
        self.load()

    def load(self) -> None:
        if not self.path.exists():
            return
        data = json.loads(self.path.read_text())
        self._items = {key: IndexedSourceManifest.model_validate(value) for key, value in data.items()}

    def save(self) -> None:
        self.path.parent.mkdir(parents=True, exist_ok=True)
        payload = json.dumps({key: value.model_dump(mode="json") for key, value in self._items.items()}, indent=2, sort_keys=True)
        fd, tmp_name = tempfile.mkstemp(prefix=f".{self.path.name}.", suffix=".tmp", dir=self.path.parent)
        try:
            with os.fdopen(fd, "w") as handle:
                handle.write(payload)
                handle.flush()
                os.fsync(handle.fileno())
            os.replace(tmp_name, self.path)
        finally:
            if os.path.exists(tmp_name):
                os.unlink(tmp_name)

    def get(self, source_id: str) -> IndexedSourceManifest | None:
        return self._items.get(source_id)

    def upsert(self, item: IndexedSourceManifest) -> None:
        self._items[item.source_id] = item

    def active_chunk_ids(self) -> set[str]:
        return {chunk_id for item in self._items.values() for chunk_id in item.chunk_ids}

    def remove_missing(self, active_source_ids: set[str]) -> list[IndexedSourceManifest]:
        removed: list[IndexedSourceManifest] = []
        for source_id in list(self._items):
            if source_id not in active_source_ids:
                removed.append(self._items.pop(source_id))
        return removed
