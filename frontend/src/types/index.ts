export type RepositoryFacts = {
  owner: string;
  name: string;
  full_name: string;
  url: string;
  description: string | null;
  language: string | null;
  stars: number;
  forks: number;
  open_issues: number;
  default_branch: string;
  license_name: string | null;
  is_private: boolean;
  pushed_at: string | null;
};

export type TreeEntry = {
  path: string;
  type: "file" | "directory";
  size: number | null;
};

export type RepositoryAnalysis = {
  facts: RepositoryFacts;
  readme_found: boolean;
  readme_excerpt: string | null;
  tree: TreeEntry[];
  ai: {
    status: "available" | "unavailable";
    explanation: string | null;
    suggested_files: string[];
    contribution_starting_points: string[];
    caveat: string | null;
  };
  warnings: string[];
};

export type ScreenshotExplanation = {
  status: "available";
  likely_error: string;
  explanation: string;
  possible_causes: string[];
  suggested_fix: string;
  next_steps: string[];
  confidence_note: string;
};

export type APIError = Error & { status?: number };

