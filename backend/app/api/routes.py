from fastapi import APIRouter, Depends, File, HTTPException, Request, UploadFile, status
from starlette.concurrency import run_in_threadpool

from app.core.config import Settings, get_settings
from app.core.rate_limit import enforce_demo_rate_limit
from app.models.schemas import (
    RepositoryAIInsights,
    RepositoryAnalysisResponse,
    RepositoryAnalyzeRequest,
    RepositoryFacts,
    ScreenshotExplanation,
    TreeEntry,
)
from app.services.ai_service import AIService, AIServiceError
from app.services.github_service import GitHubService, GitHubServiceError, parse_github_repository_url


router = APIRouter(prefix="/api")


def _github_service(settings: Settings = Depends(get_settings)) -> GitHubService:
    return GitHubService(settings)


def _ai_service(settings: Settings = Depends(get_settings)) -> AIService:
    return AIService(settings)


@router.get("/health")
async def health(settings: Settings = Depends(get_settings)) -> dict:
    return {
        "status": "ok",
        "service": settings.app_name,
        "ai_configured": bool(settings.google_api_key and settings.gemma_model),
        "vision_configured": bool(settings.google_api_key and settings.gemma_model and settings.gemma_model_supports_vision),
    }


@router.post("/repository/analyze", response_model=RepositoryAnalysisResponse)
async def analyze_repository(
    payload: RepositoryAnalyzeRequest,
    request: Request,
    github: GitHubService = Depends(_github_service),
    ai: AIService = Depends(_ai_service),
) -> RepositoryAnalysisResponse:
    enforce_demo_rate_limit(request, "repository")
    try:
        owner, repo = parse_github_repository_url(str(payload.url))
        repository = await github.get_repository(owner, repo)
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail=str(exc)) from exc
    except GitHubServiceError as exc:
        response_status = 404 if exc.status_code == 404 else 502 if exc.status_code not in {403, 429} else exc.status_code
        raise HTTPException(status_code=response_status, detail=str(exc)) from exc

    metadata = repository.metadata
    facts = RepositoryFacts(
        owner=owner,
        name=metadata.get("name", repo),
        full_name=metadata.get("full_name", f"{owner}/{repo}"),
        url=metadata.get("html_url", str(payload.url)),
        description=metadata.get("description"),
        language=metadata.get("language"),
        stars=metadata.get("stargazers_count", 0),
        forks=metadata.get("forks_count", 0),
        open_issues=metadata.get("open_issues_count", 0),
        default_branch=metadata.get("default_branch", "main"),
        license_name=(metadata.get("license") or {}).get("spdx_id"),
        is_private=bool(metadata.get("private", False)),
        pushed_at=metadata.get("pushed_at"),
    )

    ai_payload = RepositoryAIInsights(status="unavailable", caveat="AI insights are not available yet.")
    try:
        generated = await run_in_threadpool(
            ai.explain_repository,
            facts.model_dump(mode="json"),
            repository.readme,
            repository.tree,
        )
        ai_payload = RepositoryAIInsights(
            status="available",
            explanation=str(generated.get("explanation", "")).strip() or None,
            suggested_files=[str(item) for item in generated.get("suggested_files", []) if str(item).strip()][:6],
            contribution_starting_points=[str(item) for item in generated.get("contribution_starting_points", []) if str(item).strip()][:4],
            caveat="AI suggestions are hypotheses based on the visible repository context; verify them in GitHub.",
        )
    except AIServiceError as exc:
        ai_payload = RepositoryAIInsights(status="unavailable", caveat=str(exc))

    return RepositoryAnalysisResponse(
        facts=facts,
        readme_found=repository.readme is not None,
        readme_excerpt=repository.readme[:5000] if repository.readme else None,
        tree=[TreeEntry(**item) for item in repository.tree],
        ai=ai_payload,
        warnings=repository.warnings,
    )


@router.post("/screenshot/explain", response_model=ScreenshotExplanation)
async def explain_screenshot(
    request: Request,
    file: UploadFile = File(...),
    ai: AIService = Depends(_ai_service),
    settings: Settings = Depends(get_settings),
) -> ScreenshotExplanation:
    enforce_demo_rate_limit(request, "screenshot")
    allowed_types = {"image/png", "image/jpeg", "image/webp"}
    if file.content_type not in allowed_types:
        raise HTTPException(status_code=415, detail="Upload a PNG, JPG, JPEG, or WebP image.")
    image_bytes = await file.read(settings.max_image_bytes + 1)
    if not image_bytes:
        raise HTTPException(status_code=400, detail="The uploaded image is empty.")
    if len(image_bytes) > settings.max_image_bytes:
        raise HTTPException(status_code=413, detail="That image is too large. Please upload an image under 8 MiB.")
    try:
        generated = await run_in_threadpool(ai.explain_screenshot, image_bytes, file.content_type)
    except AIServiceError as exc:
        raise HTTPException(status_code=503, detail=str(exc)) from exc
    return ScreenshotExplanation(
        status="available",
        likely_error=str(generated.get("likely_error", "No identifiable error found.")),
        explanation=str(generated.get("explanation", "The model did not provide an explanation.")),
        possible_causes=[str(item) for item in generated.get("possible_causes", [])][:6],
        suggested_fix=str(generated.get("suggested_fix", "More context is needed before suggesting a fix.")),
        next_steps=[str(item) for item in generated.get("next_steps", [])][:6],
        confidence_note=str(generated.get("confidence_note", "Review the screenshot and verify the result locally.")),
    )

