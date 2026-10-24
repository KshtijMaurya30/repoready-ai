import { useEffect, useRef, useState } from "react";
import { AlertCircle, ArrowLeft, CheckCircle2, Clipboard, Image as ImageIcon, LoaderCircle, LockKeyhole, Sparkles, UploadCloud, X } from "lucide-react";
import { Link } from "react-router-dom";
import { CopyButton } from "../components/CopyButton";
import { Pill } from "../components/Pill";
import { SectionHeading } from "../components/SectionHeading";
import { explainScreenshot } from "../services/api";
import type { APIError, ScreenshotExplanation } from "../types";

const MAX_BYTES = 8 * 1024 * 1024;
const ACCEPTED = ["image/png", "image/jpeg", "image/webp"];

function ErrorNotice({ message, retry }: { message: string; retry: () => void }) {
  return <div className="mt-8 flex flex-col gap-4 rounded-2xl border border-rose-300/20 bg-rose-400/[0.06] p-5 sm:flex-row sm:items-center sm:justify-between"><div className="flex gap-3"><AlertCircle className="mt-0.5 shrink-0 text-rose-300" size={19} /><div><p className="font-medium text-rose-100">We couldn’t explain that image</p><p className="mt-1 text-sm leading-6 text-rose-100/60">{message}</p></div></div><button type="button" onClick={retry} className="button button-secondary shrink-0">Try again</button></div>;
}

function ResultCard({ result }: { result: ScreenshotExplanation }) {
  const fullText = `Likely error\n${result.likely_error}\n\nExplanation\n${result.explanation}\n\nPossible causes\n${result.possible_causes.join("\n")}\n\nSuggested fix\n${result.suggested_fix}\n\nNext steps\n${result.next_steps.join("\n")}\n\nConfidence note\n${result.confidence_note}`;
  return <div className="mt-10 space-y-5"><div className="panel-card border-cyan/20 bg-cyan/[0.035]"><div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between"><div><div className="mb-3 flex items-center gap-2"><Pill tone="cyan"><CheckCircle2 size={12} /> Analysis ready</Pill></div><h2 className="font-display text-2xl font-semibold text-white">{result.likely_error}</h2></div><CopyButton value={fullText} label="Copy response" /></div><p className="mt-6 text-sm leading-7 text-slate-300">{result.explanation}</p></div><div className="grid gap-5 md:grid-cols-2"><div className="panel-card"><p className="eyebrow text-slate-500">Possible causes</p><div className="mt-5 space-y-3">{result.possible_causes.map((cause) => <div className="flex gap-3 rounded-xl border border-white/[0.06] bg-ink/25 p-4" key={cause}><span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-violet" /><p className="text-sm leading-6 text-slate-300">{cause}</p></div>)}</div></div><div className="panel-card"><p className="eyebrow text-slate-500">Suggested fix</p><div className="mt-5 rounded-xl border border-lime/15 bg-lime/[0.04] p-4 text-sm leading-7 text-slate-300">{result.suggested_fix}</div><p className="eyebrow mt-7 text-slate-500">Confidence note</p><p className="mt-3 text-sm leading-6 text-slate-500">{result.confidence_note}</p></div></div><div className="panel-card"><div className="flex items-center gap-3"><span className="flex h-8 w-8 items-center justify-center rounded-lg bg-cyan/10 text-cyan"><Clipboard size={16} /></span><div><p className="eyebrow text-slate-500">Debug checklist</p><h3 className="panel-title mt-1">Your next steps</h3></div></div><div className="mt-6 grid gap-3 sm:grid-cols-2">{result.next_steps.map((step, index) => <div key={step} className="flex gap-4 rounded-xl border border-white/[0.06] p-4"><span className="font-mono text-xs text-cyan">0{index + 1}</span><p className="text-sm leading-6 text-slate-300">{step}</p></div>)}</div></div></div>;
}

export function ScreenshotExplainerPage() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState("");
  const [result, setResult] = useState<ScreenshotExplanation | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => () => { if (preview) URL.revokeObjectURL(preview); }, [preview]);

  function chooseFile(candidate: File | undefined) {
    if (!candidate) return;
    if (!ACCEPTED.includes(candidate.type)) { setError("Upload a PNG, JPG, JPEG, or WebP image."); return; }
    if (candidate.size > MAX_BYTES) { setError("That image is too large. Please choose a file under 8 MiB."); return; }
    if (preview) URL.revokeObjectURL(preview);
    setFile(candidate); setPreview(URL.createObjectURL(candidate)); setResult(null); setError("");
  }

  async function submit() {
    if (!file) { setError("Choose a screenshot before asking for an explanation."); return; }
    setLoading(true); setError(""); setResult(null);
    try { setResult(await explainScreenshot(file)); } catch (requestError) { setError((requestError as APIError).message); } finally { setLoading(false); }
  }

  function clearFile() { if (preview) URL.revokeObjectURL(preview); setFile(null); setPreview(""); setResult(null); setError(""); if (inputRef.current) inputRef.current.value = ""; }

  return <div className="container-shell py-14 sm:py-20"><Link to="/" className="back-link"><ArrowLeft size={15} /> Back to home</Link><div className="mt-10 grid items-end gap-8 lg:grid-cols-[1fr_0.72fr]"><SectionHeading eyebrow="Screenshot Explainer" title="Turn a scary error into your next move." description="Upload a screenshot of a coding error. The configured multimodal Gemma model will explain what is visible, what might be causing it, and what to try next." /><div className="rounded-2xl border border-cyan/20 bg-cyan/[0.06] p-5"><div className="flex items-start gap-3"><LockKeyhole className="mt-0.5 shrink-0 text-cyan" size={18} /><div><p className="text-sm font-medium text-white">Private by design</p><p className="mt-1 text-xs leading-5 text-slate-400">Images are validated, sent for analysis, and not stored by this app. Don’t include passwords or secrets.</p></div></div></div></div>
    <div className="mt-10 grid gap-5 lg:grid-cols-[0.8fr_1.2fr]"><div><div className={`upload-zone ${dragging ? "upload-zone-active" : ""}`} onDragOver={(event) => { event.preventDefault(); setDragging(true); }} onDragLeave={() => setDragging(false)} onDrop={(event) => { event.preventDefault(); setDragging(false); chooseFile(event.dataTransfer.files[0]); }}><input ref={inputRef} type="file" accept="image/png,image/jpeg,image/webp" className="sr-only" onChange={(event) => chooseFile(event.target.files?.[0])} /><div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-cyan/20 bg-cyan/[0.08] text-cyan"><UploadCloud size={24} /></div><h3 className="mt-5 font-display text-lg font-semibold text-white">Drop your screenshot here</h3><p className="mt-2 text-sm text-slate-500">PNG, JPG, JPEG, or WebP · max 8 MiB</p><button type="button" onClick={() => inputRef.current?.click()} className="button button-secondary mt-6">Browse file <ImageIcon size={15} /></button></div>{file && <div className="mt-4 flex items-center justify-between rounded-xl border border-white/[0.07] bg-panel/60 px-4 py-3"><div className="flex min-w-0 items-center gap-3"><ImageIcon size={16} className="shrink-0 text-cyan" /><div className="min-w-0"><p className="truncate text-sm text-slate-300">{file.name}</p><p className="text-xs text-slate-600">{(file.size / 1024 / 1024).toFixed(2)} MiB</p></div></div><button type="button" onClick={clearFile} className="icon-button" aria-label="Remove selected file"><X size={16} /></button></div>}<button type="button" onClick={submit} disabled={!file || loading} className="button button-primary mt-4 w-full">{loading ? <><LoaderCircle className="animate-spin" size={16} /> Reading screenshot…</> : <><Sparkles size={16} /> Explain this error</>}</button></div><div className="panel-card flex items-start gap-3"><LockKeyhole className="mt-0.5 shrink-0 text-slate-500" size={16} /><p className="text-xs leading-5 text-slate-500">For the best result, include the full error message and a little surrounding code. Blur tokens, API keys, and personal information first.</p></div></div><div className="panel-card min-h-[340px] p-4">{preview ? <div className="relative h-full overflow-hidden rounded-xl border border-white/[0.06] bg-ink/50"><img src={preview} alt="Selected coding error screenshot preview" className="h-full max-h-[460px] w-full object-contain" /><div className="absolute left-4 top-4"><Pill tone="muted">Preview only</Pill></div></div> : <div className="flex h-full min-h-[300px] flex-col items-center justify-center rounded-xl border border-dashed border-white/[0.08] bg-ink/20 text-center"><div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/[0.04] text-slate-600"><ImageIcon size={22} /></div><p className="mt-4 text-sm text-slate-500">Your screenshot preview will appear here</p></div>}</div>
    {error && <ErrorNotice message={error} retry={submit} />}{loading && <div className="mt-10 grid gap-5 md:grid-cols-2"><div className="panel-card space-y-4"><div className="skeleton h-5 w-2/5" /><div className="skeleton h-10 w-3/4" /><div className="skeleton h-24 w-full" /></div><div className="panel-card space-y-4"><div className="skeleton h-5 w-1/3" /><div className="skeleton h-24 w-full" /><div className="skeleton h-24 w-full" /></div></div>}{result && !loading && <ResultCard result={result} />}
  </div>;
}

