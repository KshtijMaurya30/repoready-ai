import pytest

from app.services.github_service import parse_github_repository_url


@pytest.mark.parametrize(
    ("value", "expected"),
    [
        ("https://github.com/openai/codex", ("openai", "codex")),
        ("https://www.github.com/user/project.git", ("user", "project")),
        ("https://github.com/user/project/", ("user", "project")),
    ],
)
def test_parse_github_repository_url(value: str, expected: tuple[str, str]) -> None:
    assert parse_github_repository_url(value) == expected


@pytest.mark.parametrize("value", ["https://gitlab.com/user/project", "https://github.com", "not-a-url"])
def test_parse_github_repository_url_rejects_invalid_hosts_and_paths(value: str) -> None:
    with pytest.raises(ValueError):
        parse_github_repository_url(value)

