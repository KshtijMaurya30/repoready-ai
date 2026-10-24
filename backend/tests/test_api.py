import httpx
import pytest

from app.core.config import Settings
from app.main import app
from app.services.github_service import GitHubServiceError


def api_client() -> httpx.AsyncClient:
    return httpx.AsyncClient(transport=httpx.ASGITransport(app=app), base_url="http://test")


@pytest.mark.asyncio
async def test_health_endpoint() -> None:
    async with api_client() as client:
        response = await client.get("/api/health")
    assert response.status_code == 200
    assert response.json()["status"] == "ok"


@pytest.mark.asyncio
async def test_invalid_repository_url() -> None:
    async with api_client() as client:
        response = await client.post("/api/repository/analyze", json={"url": "https://gitlab.com/a/b"})
    assert response.status_code == 422


@pytest.mark.asyncio
async def test_inaccessible_repository_maps_to_not_found(monkeypatch: pytest.MonkeyPatch) -> None:
    async def fail(*_: object, **__: object):
        raise GitHubServiceError("not found", status_code=404)

    from app.api import routes

    monkeypatch.setattr(routes.GitHubService, "get_repository", fail)
    async with api_client() as client:
        response = await client.post("/api/repository/analyze", json={"url": "https://github.com/a/b"})
    assert response.status_code == 404


@pytest.mark.asyncio
async def test_invalid_image_type() -> None:
    async with api_client() as client:
        response = await client.post("/api/screenshot/explain", files={"file": ("notes.txt", b"hello", "text/plain")})
    assert response.status_code == 415


@pytest.mark.asyncio
async def test_oversized_image() -> None:
    from app.api import routes

    settings = Settings(max_image_bytes=4)
    app.dependency_overrides[routes.get_settings] = lambda: settings
    async with api_client() as client:
        response = await client.post("/api/screenshot/explain", files={"file": ("error.png", b"12345", "image/png")})
    app.dependency_overrides.clear()
    assert response.status_code == 413


@pytest.mark.asyncio
async def test_missing_ai_key_is_reported_for_screenshot() -> None:
    from app.api import routes

    settings = Settings(gemma_model="gemma-test", google_api_key=None, gemma_model_supports_vision=True)
    app.dependency_overrides[routes.get_settings] = lambda: settings
    async with api_client() as client:
        response = await client.post("/api/screenshot/explain", files={"file": ("error.png", b"fake", "image/png")})
    app.dependency_overrides.clear()
    assert response.status_code == 503
    assert "GOOGLE_API_KEY" in response.json()["detail"]

