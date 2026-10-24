import base64
from dataclasses import dataclass
from urllib.parse import urlparse

import httpx

from app.core.config import Settings


class GitHubServiceError(Exception):
    def __init__(self, message: str, status_code: int | None = None):
        super().__init__(message)
        self.status_code = status_code


@dataclass
class GitHubRepositoryData:
    metadata: dict
    readme: str | None
    tree: list[dict]
    warnings: list[str]


def parse_github_repository_url(repository_url: str) -> tuple[str, str]:
    """Return owner/name for a public GitHub repo URL without accepting arbitrary hosts."""

    parsed = urlparse(repository_url)
    if parsed.scheme not in {"http", "https"} or parsed.netloc.lower() not in {"github.com", "www.github.com"}:
        raise ValueError("Enter a public github.com repository URL.")
    parts = [part for part in parsed.path.split("/") if part]
    if len(parts) < 2:
        raise ValueError("Use a repository URL like https://github.com/owner/repository.")
    owner, repo = parts[0], parts[1]
    if repo.endswith(".git"):
        repo = repo[:-4]
    if not owner or not repo:
        raise ValueError("That GitHub repository URL is not valid.")
    return owner, repo


@dataclass
class _RequestClient:
    client: httpx.AsyncClient
    owns_client: bool


class GitHubService:
    def __init__(self, settings: Settings, client: httpx.AsyncClient | None = None):
        self.settings = settings
        self._client = client

    def _headers(self) -> dict[str, str]:
        headers = {
            "Accept": "application/vnd.github+json",
            "X-GitHub-Api-Version": "2022-11-28",
            "User-Agent": "RepoReady-AI/1.0",
        }
        if self.settings.github_token:
            headers["Authorization"] = f"Bearer {self.settings.github_token}"
        return headers

    async def _request(self, url: str) -> httpx.Response:
        owns_client = self._client is None
        client = self._client or httpx.AsyncClient(timeout=self.settings.request_timeout_seconds)
        try:
            response = await client.get(url, headers=self._headers())
        except httpx.TimeoutException as exc:
            raise GitHubServiceError("GitHub took too long to respond. Please retry.") from exc
        except httpx.HTTPError as exc:
            raise GitHubServiceError("GitHub could not be reached. Check your connection and retry.") from exc
        finally:
            if owns_client:
                await client.aclose()
        return response

    @staticmethod
    def _raise_for_response(response: httpx.Response, resource: str) -> None:
        if response.status_code == 404:
            raise GitHubServiceError(
                f"This public repository or {resource} could not be found. It may be private or inaccessible.",
                response.status_code,
            )
        if response.status_code == 403 or response.status_code == 429:
            raise GitHubServiceError("GitHub API rate limit reached. Add a read-only token or try again later.", response.status_code)
        if response.status_code >= 400:
            raise GitHubServiceError("GitHub returned an error while reading this repository.", response.status_code)

    async def get_repository(self, owner: str, repo: str) -> GitHubRepositoryData:
        base = self.settings.github_api_base.rstrip("/")
        metadata_response = await self._request(f"{base}/repos/{owner}/{repo}")
        self._raise_for_response(metadata_response, "repository")
        metadata = metadata_response.json()
        if metadata.get("private"):
            raise GitHubServiceError("Private repositories are not supported by this public analysis flow.", 403)

        warnings: list[str] = []
        readme: str | None = None
        readme_response = await self._request(f"{base}/repos/{owner}/{repo}/readme")
        if readme_response.status_code == 404:
            warnings.append("No README file was found, so the explanation has less documentation context.")
        else:
            self._raise_for_response(readme_response, "README")
            readme_payload = readme_response.json()
            encoded_content = readme_payload.get("content", "")
            try:
                readme = base64.b64decode(encoded_content).decode("utf-8", errors="replace")
            except (ValueError, UnicodeDecodeError):
                warnings.append("The README could not be decoded cleanly.")

        tree: list[dict] = []
        branch = metadata.get("default_branch") or "main"
        tree_response = await self._request(f"{base}/repos/{owner}/{repo}/git/trees/{branch}?recursive=1")
        if tree_response.status_code == 409:
            warnings.append("The repository tree is empty or unavailable.")
        elif tree_response.status_code == 404:
            warnings.append("The default branch tree could not be read.")
        else:
            self._raise_for_response(tree_response, "directory tree")
            tree_payload = tree_response.json()
            if tree_payload.get("truncated"):
                warnings.append("GitHub truncated the tree response; only the first entries are shown.")
            for item in tree_payload.get("tree", [])[:120]:
                item_type = "directory" if item.get("type") == "tree" else "file"
                tree.append({"path": item.get("path", ""), "type": item_type, "size": item.get("size")})

        return GitHubRepositoryData(metadata=metadata, readme=readme, tree=tree, warnings=warnings)

