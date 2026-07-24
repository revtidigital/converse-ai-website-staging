from datetime import UTC, datetime
from enum import StrEnum
from typing import Literal

from pydantic import BaseModel, ConfigDict, Field, HttpUrl, field_validator


class ContentType(StrEnum):
    HOME = "home"
    PAGE = "page"
    SERVICE = "service"
    SOLUTION = "solution"
    FEATURE = "feature"
    BLOG = "blog"
    CASE_STUDY = "case_study"
    PRICING = "pricing"
    FAQ = "faq"
    TERMS = "terms"
    PRIVACY = "privacy"
    CONTACT = "contact"


class SourceSection(BaseModel):
    model_config = ConfigDict(extra="forbid")
    heading: str = Field(default="", max_length=300)
    heading_level: int = Field(ge=1, le=6)
    heading_path: list[str] = Field(default_factory=list, max_length=8)
    content: str = Field(min_length=1, max_length=12000)


class KnowledgeSource(BaseModel):
    model_config = ConfigDict(extra="forbid")
    source_id: str = Field(min_length=1, max_length=200)
    route: str = Field(min_length=1, max_length=2048)
    canonical_url: HttpUrl
    page_title: str = Field(min_length=1, max_length=300)
    content_type: ContentType
    updated_at: datetime = Field(default_factory=lambda: datetime.now(UTC))
    sections: list[SourceSection] = Field(min_length=1, max_length=200)
    checksum: str = Field(default="", max_length=128)
    publication_status: Literal["published"] = "published"

    @field_validator("route")
    @classmethod
    def route_is_internal(cls, value: str) -> str:
        if not value.startswith("/") or value.startswith("//"):
            raise ValueError("route must be an internal path")
        return value


class KnowledgeChunk(BaseModel):
    model_config = ConfigDict(extra="forbid")
    chunk_id: str = Field(min_length=1, max_length=200)
    source_id: str = Field(min_length=1, max_length=200)
    route: str = Field(min_length=1, max_length=2048)
    canonical_url: str = Field(min_length=1, max_length=4096)
    page_title: str = Field(min_length=1, max_length=300)
    heading: str = Field(default="", max_length=300)
    heading_path: list[str] = Field(default_factory=list, max_length=8)
    content: str = Field(min_length=1, max_length=4000)
    content_type: ContentType
    chunk_index: int = Field(ge=0)
    updated_at: datetime
    checksum: str = Field(min_length=1, max_length=128)
    index_version: str = Field(min_length=1, max_length=40)
    publication_status: Literal["published"] = "published"


class SourceMetadata(BaseModel):
    model_config = ConfigDict(extra="forbid")
    title: str = Field(min_length=1, max_length=300)
    route: str = Field(min_length=1, max_length=2048)
    canonicalUrl: str = Field(min_length=1, max_length=4096)
    heading: str = Field(default="", max_length=300)
    snippet: str = Field(min_length=1, max_length=360)
    contentType: str = Field(min_length=1, max_length=80)


class RetrievalMatch(BaseModel):
    model_config = ConfigDict(extra="forbid")
    chunk: KnowledgeChunk
    score: float = Field(ge=0)


class RetrievalResult(BaseModel):
    model_config = ConfigDict(extra="forbid")
    context_chunks: list[KnowledgeChunk] = Field(default_factory=list)
    sources: list[SourceMetadata] = Field(default_factory=list)

    @property
    def context_texts(self) -> list[str]:
        return [chunk.content for chunk in self.context_chunks]


class IndexedSourceManifest(BaseModel):
    model_config = ConfigDict(extra="forbid")
    source_id: str
    source_route: str
    source_checksum: str
    chunk_ids: list[str]
    updated_at: datetime
    index_version: str
    embedding_model: str
    embedding_dimension: int
    last_successful_index_at: datetime


class IndexSummary(BaseModel):
    model_config = ConfigDict(extra="forbid")
    discovered: int = 0
    indexed: int = 0
    unchanged: int = 0
    removed: int = 0
    failed: int = 0
    chunks_upserted: int = 0
    duration_ms: int = 0

    def add(self, other: "IndexSummary") -> None:
        self.discovered += other.discovered
        self.indexed += other.indexed
        self.unchanged += other.unchanged
        self.removed += other.removed
        self.failed += other.failed
        self.chunks_upserted += other.chunks_upserted
        self.duration_ms += other.duration_ms

