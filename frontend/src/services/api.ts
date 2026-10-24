import type { APIError, RepositoryAnalysis, ScreenshotExplanation } from "../types";

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? "";

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`${API_BASE}${path}`, {
      ...options,
      headers: {
        Accept: "application/json",
        ...(options?.headers ?? {}),
      },
    });
  } catch {
    const error = new Error("The API could not be reached. Is the backend running?") as APIError;
    throw error;
  }

  const payload = (await response.json().catch(() => ({}))) as { detail?: string };
  if (!response.ok) {
    const error = new Error(payload.detail ?? "Something went wrong. Please try again.") as APIError;
    error.status = response.status;
    throw error;
  }
  return payload as T;
}

export function analyzeRepository(url: string): Promise<RepositoryAnalysis> {
  return request<RepositoryAnalysis>("/api/repository/analyze", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ url }),
  });
}

export function explainScreenshot(file: File): Promise<ScreenshotExplanation> {
  const formData = new FormData();
  formData.append("file", file);
  return request<ScreenshotExplanation>("/api/screenshot/explain", {
    method: "POST",
    body: formData,
  });
}

