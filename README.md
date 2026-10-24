# RepoReady AI

> Understand Code. Fix Errors. Contribute with Confidence.

RepoReady AI is a production-style MVP that helps beginners make sense of public GitHub repositories and turn coding-error screenshots into clear, actionable debugging guidance. It combines verified GitHub metadata with optional Gemma-powered explanations, while keeping the two sources visibly separate.

## Problem statement

Open-source repositories can feel intimidating: the directory tree is unfamiliar, documentation assumes context, and an error screenshot often does not explain what to try next. RepoReady AI gives a beginner a gentle first map of a codebase and a practical debugging checklist without pretending that AI guesses are facts.

## Features

- Public GitHub repository analysis with URL validation, metadata, README excerpt, and directory tree.
- Beginner-friendly repository explanation powered by a configurable Google Gen AI Gemma model.
- Suggested files to explore and contribution starting points, marked as AI suggestions.
- Screenshot upload with drag-and-drop, preview, MIME/size validation, and multimodal Gemma explanation.
- Copy-to-clipboard actions, retry states, responsive dashboard, and accessible keyboard interactions.
- Honest failure states for private/inaccessible repositories, missing README files, API limits, unavailable models, and unclear screenshots.
- No repository code execution and no persistent screenshot storage.

## Project structure

```text
repoready-ai/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   └── types/
│   ├── public/
│   └── package.json
├── backend/
│   ├── app/
│   │   ├── api/
│   │   ├── core/
│   │   ├── models/
│   │   └── services/
│   ├── tests/
│   ├── requirements.txt
│   └── .env.example
├── .gitignore
├── LICENSE
└── README.md
```

## Architecture

The Vite React client calls a small FastAPI API. The backend validates and fetches public GitHub data with `httpx`, then sends carefully bounded, untrusted repository excerpts to the configured Gemma model. Uploaded screenshots are read in memory, validated by MIME type and byte size, and sent directly to the model provider without being saved to disk.

```text
Browser → FastAPI → GitHub REST API
                 ↘ Google Gen AI / Gemma
```

Repository facts and model-generated insights use separate response fields. A model outage therefore never becomes a fabricated summary: the UI displays the verified facts and an explicit AI-unavailable state.

## Technology stack

- Frontend: React, Vite, TypeScript, Tailwind CSS, Lucide React, React Router.
- Backend: Python, FastAPI, Pydantic, httpx, Google Gen AI Python SDK.
- Providers: GitHub REST API and a user-selected Gemma model from Google AI Studio/Vertex-compatible configuration.

## Screenshots

Add product screenshots here when capturing a local run:

```text
![Landing page](docs/screenshots/landing.png)
![Repository Doctor](docs/screenshots/repository-doctor.png)
![Screenshot Explainer](docs/screenshots/screenshot-explainer.png)
```

## Local setup

### 1. Configure the backend

```powershell
cd backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
Copy-Item .env.example .env
```

Edit `backend/.env` and set:

- `GOOGLE_API_KEY`: your Google AI API key.
- `GEMMA_MODEL`: the exact Gemma model identifier enabled for your account. The application intentionally does not guess this value.
- `GEMMA_MODEL_SUPPORTS_VISION=true` only when that selected Gemma model accepts image input. If it is false, screenshot analysis returns a clear configuration error.

### 2. Start FastAPI

```powershell
cd backend
.\.venv\Scripts\Activate.ps1
uvicorn app.main:app --reload --port 8000
```

### 3. Start the frontend

```powershell
cd frontend
npm install
npm run dev
```

Open the URL printed by Vite, normally `http://localhost:5173`.

## Environment variables

See [`backend/.env.example`](backend/.env.example) and [`frontend/.env.example`](frontend/.env.example). The important variables are:

| Variable | Required | Purpose |
| --- | --- | --- |
| `GOOGLE_API_KEY` | For AI | Google Gen AI credential; backend only |
| `GEMMA_MODEL` | For AI | Exact supported Gemma model identifier |
| `GEMMA_MODEL_SUPPORTS_VISION` | For screenshots | Explicitly declares image support for the configured model |
| `GITHUB_TOKEN` | Optional | Raises GitHub API quota; use a fine-grained token with no repository write scope |
| `FRONTEND_ORIGINS` | Optional | Comma-separated allowed browser origins |
| `MAX_IMAGE_BYTES` | Optional | Upload limit, default 8 MiB |
| `RATE_LIMIT_PER_MINUTE` | Optional | In-memory demo limit per IP and endpoint |
| `VITE_API_BASE_URL` | Optional | Frontend API origin; leave blank for the local Vite proxy |

## Testing

Backend tests mock GitHub and Google calls, so real credentials are not needed:

```powershell
cd backend
pytest
```

For the frontend type/build check:

```powershell
cd frontend
npm run build
```

These commands are provided as verification steps; run them locally to confirm the current environment and dependency installation.

## Limitations

- The demo rate limiter is in-memory and resets when the process restarts; use a shared store for production.
- GitHub unauthenticated requests are subject to GitHub rate limits. A read-only token is supported but not required.
- AI output depends on the capabilities, context window, and availability of the selected Gemma model.
- The repository tree is intentionally bounded to keep requests fast and safe.
- RepoReady AI does not execute repository code, inspect private repositories, or claim an issue is beginner-friendly unless issue data is explicitly added and verified.

## Privacy and security

API keys stay in the backend environment and are never sent to the browser. Repository content and uploaded images are treated as untrusted input. The server does not write screenshots to disk or retain them after a request. Do not upload credentials, personal data, or proprietary code. Deploy behind HTTPS, add a shared rate limiter, and store secrets in a managed secret store before production use.

## Future improvements

- Authenticated GitHub App flow with least-privilege repository access.
- Verified issue retrieval with transparent filters and links back to GitHub.
- Streaming explanations and persisted, user-owned analysis history.
- Accessibility audit, telemetry with opt-in consent, and a shared production rate limiter.

## License

MIT. See [`LICENSE`](LICENSE).

