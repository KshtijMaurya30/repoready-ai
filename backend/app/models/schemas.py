from typing import Literal

from pydantic import BaseModel, Field, HttpUrl, field_validator


class RepositoryAnalyzeRequest(BaseModel):
    url: HttpUrl

    @field_validator("url")
    @classmethod
    def require_github_url(cls, value: HttpUrl) -> HttpUrl:
        if value.host.lower() not in {"github.com", "www.github.com"}:
            raise ValueError("Only public github.com repository URLs are supported.")
        return value


class RepositoryFacts(BaseModel):
    owner: str
    name: str
    full_name: str
    url: HttpUrl
    description: str | None = None
    language: str | None = None
    stars: int = 0
    forks: int = 0
    open_issues: int = 0
    default_branch: str
    license_name: str | None = None
    is_private: bool = False
    pushed_at: str | None = None


class TreeEntry(BaseModel):
    path: str
    type: Literal["file", "directory"]
    size: int | None = None


class RepositoryAIInsights(BaseModel):
    status: Literal["available", "unavailable"]
    explanation: str | None = None
    suggested_files: list[str] = Field(default_factory=list)
    contribution_starting_points: list[str] = Field(default_factory=list)
    caveat: str | None = None


class RepositoryAnalysisResponse(BaseModel):
    facts: RepositoryFacts
    readme_found: bool
    readme_excerpt: str | None = None
    tree: list[TreeEntry] = Field(default_factory=list)
    ai: RepositoryAIInsights
    warnings: list[str] = Field(default_factory=list)


class ErrorResponse(BaseModel):
    detail: str
    code: str | None = None


class ScreenshotExplanation(BaseModel):
    status: Literal["available"]
    likely_error: str
    explanation: str
    possible_causes: list[str] = Field(default_factory=list)
    suggested_fix: str
    next_steps: list[str] = Field(default_factory=list)
    confidence_note: str

