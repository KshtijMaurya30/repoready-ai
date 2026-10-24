import { BrainCircuit, FolderGit2 } from "lucide-react";

export function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <span className="flex items-center gap-3" aria-label="RepoReady AI home">
      <span className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-violet/40 bg-violet/10 text-violet shadow-glow">
        <FolderGit2 size={21} strokeWidth={1.8} />
        <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full border-2 border-ink bg-cyan text-ink">
          <BrainCircuit size={9} strokeWidth={2.5} />
        </span>
      </span>
      {!compact && (
        <span className="font-display text-lg font-semibold tracking-tight text-white">
          RepoReady <span className="text-cyan">AI</span>
        </span>
      )}
    </span>
  );
}

