import { useMemo, useState } from "react";
import { AlertCircle, ArrowLeft, CheckCircle2, ChevronDown, ChevronRight, CircleDot, FileCode2, Folder, Github, Lightbulb, LoaderCircle, Search, ShieldCheck, Star, GitFork, ExternalLink } from "lucide-react";
import { Link } from "react-router-dom";
import { CopyButton } from "../components/CopyButton";
import { Pill } from "../components/Pill";
import { SectionHeading } from "../components/SectionHeading";
import { analyzeRepository } from "../services/api";
import type { APIError, RepositoryAnalysis, TreeEntry } from "../types";

function formatNumber(value: number) {
  return new Intl.NumberFormat("en", { notation: "compact", maximumFractionDigits: 1 }).format(value);
}

function TreeView({ entries }: { entries: TreeEntry[] }) {
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const visibleEntries = useMemo(() => {
    const roots = entries.filter((entry) => !entry.path.includes("/"));
    return roots.length ? roots : entries.slice(0, 40);
  }, [entries]);

  if (!entries.length) return <div className="empty-state">No directory entries were returned by GitHub.</div>;

  return <div className="tree-list">{visibleEntries.map((entry) => {
    const isFolder = entry.type === "directory";
    const isOpen = expanded[entry.path] ?? false;
    const children = entries.filter((candidate) => candidate.path.startsWith(`${entry.path}/`) && !candidate.path.slice(entry.path.length + 1).includes("/"));
    return <div key={entry.path}>
      <button type="button" className="tree-row" onClick={() => isFolder && setExpanded((state) => ({ ...state, [entry.path]: !isOpen }))}>
        {isFolder ? (isOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />) : <span className="w-3.5" />}
        {isFolder ? <Folder size={15} className="text-cyan" /> : <FileCode2 size={15} className="text-slate-500" />}
        <span className="truncate">{entry.path}</span>
      </button>
      {isFolder && isOpen && children.map((child) => <div className="tree-row tree-row-child" key={child.path}><span className="w-3.5" /><span className="w-3.5" /><FileCode2 size={14} className="text-slate-500" /><span className="truncate">{child.path}</span></div>)}
    </div>;
  })}</div>;
}

function LoadingDashboard() {
  return <div className="mt-10 grid gap-5 lg:grid-cols-[0.7fr_1.3fr]"><div className="panel-card space-y-5"><div className="skeleton h-4 w-2/5" /><div className="skeleton h-8 w-4/5" /><div className="skeleton h-4 w-full" /><div className="skeleton h-4 w-3/4" /><div className="grid grid-cols-3 gap-3 pt-6"><div className="skeleton h-16" /><div className="skeleton h-16" /><div className="skeleton h-16" /></div></div><div className="panel-card space-y-5"><div className="skeleton h-5 w-1/3" /><div className="skeleton h-28 w-full" /><div className="skeleton h-5 w-2/5" /><div className="skeleton h-20 w-full" /></div></div>;
}

function ErrorNotice({ message, retry }: { message: string; retry: () => void }) {
  return <div className="mt-8 flex flex-col gap-4 rounded-2xl border border-rose-300/20 bg-rose-400/[0.06] p-5 sm:flex-row sm:items-center sm:justify-between"><div className="flex gap-3"><AlertCircle className="mt-0.5 shrink-0 text-rose-300" size={19} /><div><p className="font-medium text-rose-100">We couldn’t analyze that repository</p><p className="mt-1 text-sm leading-6 text-rose-100/60">{message}</p></div></div><button type="button" onClick={retry} className="button button-secondary shrink-0">Try again</button></div>;
}

function RepositoryResults({ result }: { result: RepositoryAnalysis }) {
  const { facts, ai } = result;
  const aiCopy = [ai.explanation, ...ai.suggested_files, ...ai.contribution_starting_points].filter(Boolean).join("\n\n");
  return <div className="mt-10 space-y-5">
    <div className="panel-card overflow-hidden p-0"><div className="border-b border-white/[0.07] p-6 sm:p-8"><div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between"><div><div className="mb-3 flex items-center gap-2 text-sm text-slate-500"><Github size={16} /> {facts.full_name}</div><h2 className="font-display text-3xl font-semibold text-white">{facts.name}</h2><p className="mt-3 max-w-2xl text-sm leading-6 text-slate-400">{facts.description ?? "No description was provided by this repository."}</p></div><a href={facts.url} target="_blank" rel="noreferrer" className="button button-secondary shrink-0">Open on GitHub <ExternalLink size={14} /></a></div><div className="mt-7 flex flex-wrap gap-3"><Pill tone="cyan"><CircleDot size={12} /> {facts.language ?? "Language not listed"}</Pill><Pill tone="muted"><Star size={12} /> {formatNumber(facts.stars)} stars</Pill><Pill tone="muted"><GitFork size={12} /> {formatNumber(facts.forks)} forks</Pill><Pill tone="muted">{facts.default_branch} branch</Pill></div></div><div className="grid grid-cols-2 divide-x divide-white/[0.07] sm:grid-cols-4"><div className="p-5"><p className="metric-label">Open issues</p><p className="metric-value">{formatNumber(facts.open_issues)}</p></div><div className="p-5"><p className="metric-label">License</p><p className="metric-value text-base">{facts.license_name ?? "Not listed"}</p></div><div className="p-5"><p className="metric-label">README</p><p className="metric-value text-base">{result.readme_found ? "Found" : "Missing"}</p></div><div className="p-5"><p className="metric-label">Source</p><p className="metric-value text-base text-lime">Verified</p></div></div></div>

    {result.warnings.map((warning) => <div key={warning} className="flex items-start gap-3 rounded-xl border border-amber-300/15 bg-amber-200/[0.04] p-4 text-sm text-amber-100/70"><AlertCircle size={17} className="mt-0.5 shrink-0 text-amber-300" />{warning}</div>)}

    <div className="grid gap-5 lg:grid-cols-[1.15fr_0.85fr]"><div className="panel-card"><div className="flex items-start justify-between gap-4"><div><div className="mb-2 flex items-center gap-2"><BrainIcon /><Pill tone={ai.status === "available" ? "violet" : "muted"}>{ai.status === "available" ? "AI insight" : "AI unavailable"}</Pill></div><h3 className="panel-title">A clearer first read</h3></div>{ai.status === "available" && <CopyButton value={aiCopy} />}</div>{ai.status === "available" ? <p className="mt-5 whitespace-pre-line text-sm leading-7 text-slate-300">{ai.explanation}</p> : <div className="mt-5 rounded-xl border border-white/[0.06] bg-ink/30 p-4 text-sm leading-6 text-slate-400"><p>{ai.caveat}</p><p className="mt-3 text-xs text-slate-600">The verified repository data is still available below. Configure Gemma on the backend to enable explanations.</p></div>}{ai.status === "available" && <div className="mt-7 flex items-start gap-3 rounded-xl border border-violet/20 bg-violet/[0.06] p-4 text-xs leading-5 text-violet-100/70"><ShieldCheck size={16} className="mt-0.5 shrink-0 text-violet" />AI insight is generated from the visible repository context. Verify suggestions before acting on them.</div>}</div><div className="panel-card"><div className="flex items-center justify-between"><div><div className="mb-2 flex items-center gap-2"><Lightbulb size={16} className="text-lime" /><span className="text-xs uppercase tracking-[0.16em] text-slate-500">Suggested start</span></div><h3 className="panel-title">Files worth opening</h3></div></div>{ai.suggested_files.length ? <div className="mt-5 space-y-2">{ai.suggested_files.map((file) => <div key={file} className="rounded-lg border border-white/[0.06] bg-ink/25 px-3 py-3 font-mono text-xs text-slate-300">{file}</div>)}</div> : <p className="mt-5 text-sm leading-6 text-slate-500">Suggestions will appear when AI insights are available.</p>}</div></div>

    <div className="grid gap-5 lg:grid-cols-[0.8fr_1.2fr]"><div className="panel-card"><div className="mb-5 flex items-center justify-between"><div><div className="mb-2 flex items-center gap-2"><Folder size={16} className="text-cyan" /><span className="text-xs uppercase tracking-[0.16em] text-slate-500">Verified from GitHub</span></div><h3 className="panel-title">Project explorer</h3></div><span className="font-mono text-xs text-slate-600">{result.tree.length} entries</span></div><TreeView entries={result.tree} /></div><div className="panel-card"><div className="flex items-center justify-between"><div><div className="mb-2 flex items-center gap-2"><Lightbulb size={16} className="text-lime" /><span className="text-xs uppercase tracking-[0.16em] text-slate-500">Next steps</span></div><h3 className="panel-title">Potential contribution paths</h3></div></div>{ai.contribution_starting_points.length ? <div className="mt-5 space-y-3">{ai.contribution_starting_points.map((point, index) => <div key={point} className="flex gap-3 rounded-xl border border-white/[0.06] bg-ink/20 p-4"><span className="font-mono text-xs text-cyan">0{index + 1}</span><p className="text-sm leading-6 text-slate-300">{point}</p></div>)}</div> : <p className="mt-5 text-sm leading-6 text-slate-500">No AI contribution suggestions are available. Check the repository’s own contribution guide and issues.</p>}</div></div>

    <details className="panel-card group"><summary className="flex cursor-pointer list-none items-center justify-between"><div><div className="mb-2 flex items-center gap-2"><FileCode2 size={16} className="text-slate-500" /><span className="text-xs uppercase tracking-[0.16em] text-slate-500">Raw context</span></div><h3 className="panel-title">README excerpt</h3></div><ChevronDown size={19} className="text-slate-600 transition group-open:rotate-180" /></summary>{result.readme_excerpt ? <div className="relative mt-6"><CopyButton value={result.readme_excerpt} label="Copy README" /><pre className="max-h-80 overflow-auto whitespace-pre-wrap rounded-xl border border-white/[0.06] bg-ink/40 p-5 pr-16 font-mono text-xs leading-6 text-slate-400">{result.readme_excerpt}</pre></div> : <p className="mt-5 text-sm text-slate-500">This repository does not have a readable README file.</p>}</details>
  </div>;
}

function BrainIcon() { return <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet/10 text-violet"><Search size={16} /></span>; }

export function RepositoryDoctorPage() {
  const [url, setUrl] = useState("https://github.com/withastro/astro");
  const [result, setResult] = useState<RepositoryAnalysis | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(event?: React.FormEvent) {
    event?.preventDefault();
    try {
      const parsed = new URL(url.trim());
      if (!['github.com', 'www.github.com'].includes(parsed.hostname.toLowerCase()) || parsed.pathname.split('/').filter(Boolean).length < 2) throw new Error("Enter a public GitHub URL like github.com/owner/repository.");
    } catch (validationError) {
      setError(validationError instanceof Error ? validationError.message : "Enter a valid GitHub repository URL.");
      setResult(null);
      return;
    }
    setLoading(true); setError(""); setResult(null);
    try { setResult(await analyzeRepository(url.trim())); } catch (requestError) { setError((requestError as APIError).message); } finally { setLoading(false); }
  }

  return <div className="container-shell py-14 sm:py-20"><Link to="/" className="back-link"><ArrowLeft size={15} /> Back to home</Link><div className="mt-10 grid items-end gap-8 lg:grid-cols-[1fr_0.72fr]"><SectionHeading eyebrow="Repository Doctor" title="Make an unfamiliar codebase feel smaller." description="Paste a public GitHub URL. We’ll bring back the verified project shape, then ask Gemma for a beginner-friendly first read." /><div className="rounded-2xl border border-violet/20 bg-violet/[0.06] p-5"><div className="flex items-start gap-3"><ShieldCheck className="mt-0.5 shrink-0 text-lime" size={18} /><div><p className="text-sm font-medium text-white">Facts and suggestions stay separate</p><p className="mt-1 text-xs leading-5 text-slate-400">Metadata and file paths come from GitHub. AI guidance is labeled so you know what to verify.</p></div></div></div></div>
    <form onSubmit={submit} className="mt-10 rounded-2xl border border-white/[0.08] bg-panel/70 p-3 shadow-glow sm:flex sm:items-center"><div className="flex flex-1 items-center gap-3 px-3"><Github className="shrink-0 text-slate-500" size={19} /><input value={url} onChange={(event) => setUrl(event.target.value)} className="w-full bg-transparent py-3 text-sm text-white outline-none placeholder:text-slate-600" aria-label="GitHub repository URL" placeholder="https://github.com/owner/repository" /></div><button disabled={loading} className="button button-primary mt-2 w-full sm:mt-0 sm:w-auto" type="submit">{loading ? <><LoaderCircle className="animate-spin" size={16} /> Analyzing…</> : <><Search size={16} /> Analyze repository</>}</button></form>
    {error && <ErrorNotice message={error} retry={() => submit()} />}{loading && <LoadingDashboard />}{result && !loading && <RepositoryResults result={result} />}
    {!loading && !result && !error && <div className="mt-12 grid gap-4 sm:grid-cols-3"><div className="soft-card"><CheckCircle2 className="text-lime" size={18} /><p className="mt-4 font-medium text-white">Public repositories</p><p className="mt-2 text-sm leading-6 text-slate-500">Private and inaccessible repos are called out clearly.</p></div><div className="soft-card"><Folder className="text-cyan" size={18} /><p className="mt-4 font-medium text-white">Bounded context</p><p className="mt-2 text-sm leading-6 text-slate-500">Fast tree previews without executing repository code.</p></div><div className="soft-card"><Lightbulb className="text-violet" size={18} /><p className="mt-4 font-medium text-white">Beginner lens</p><p className="mt-2 text-sm leading-6 text-slate-500">A first read that gives you somewhere to start.</p></div></div>}
  </div>;
}

