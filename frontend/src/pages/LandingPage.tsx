import { ArrowRight, BrainCircuit, Check, Code2, FolderTree, Github, ImagePlus, ScanSearch, Sparkles, WandSparkles } from "lucide-react";
import { Link } from "react-router-dom";
import { SectionHeading } from "../components/SectionHeading";

const features = [
  { icon: ScanSearch, tone: "violet", title: "Repository Doctor", copy: "Get a fast, beginner-friendly map of any public GitHub repository — before you open twenty tabs." },
  { icon: ImagePlus, tone: "cyan", title: "Screenshot Explainer", copy: "Upload a confusing error screenshot and turn it into a clear explanation plus your next debugging move." },
  { icon: WandSparkles, tone: "lime", title: "Honest AI guidance", copy: "Verified repository facts stay separate from AI suggestions, so you always know what to double-check." },
];

const steps = [
  { number: "01", title: "Point it at a repo", copy: "Paste a public GitHub URL. RepoReady fetches metadata, README context, and a bounded project tree." },
  { number: "02", title: "Make the unknown smaller", copy: "Gemma turns the raw context into a plain-language overview and a few files worth opening first." },
  { number: "03", title: "Take your next step", copy: "Explore with confidence, or bring a coding-error screenshot for a practical debugging checklist." },
];

function DashboardPreview() {
  return (
    <div className="preview-window shadow-glow">
      <div className="flex items-center justify-between border-b border-white/[0.07] px-5 py-4">
        <div className="flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full bg-rose-400/70" /><span className="h-2.5 w-2.5 rounded-full bg-amber-300/70" /><span className="h-2.5 w-2.5 rounded-full bg-lime/70" /></div>
        <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-slate-600">analysis / ready</span>
      </div>
      <div className="grid gap-5 p-5 sm:grid-cols-[170px_1fr]">
        <div className="hidden rounded-xl border border-white/[0.06] bg-ink/50 p-3 sm:block">
          <div className="mb-4 flex items-center gap-2 text-[11px] text-slate-400"><FolderTree size={14} className="text-cyan" /> project tree</div>
          <div className="space-y-2 font-mono text-[10px] text-slate-600"><p className="text-slate-400">▾ src</p><p className="pl-3 text-cyan/80">◈ main.ts</p><p className="pl-3">◈ app.tsx</p><p className="pl-3">◈ styles.css</p><p>▾ backend</p><p className="pl-3">◈ api.py</p><p>◈ README.md</p></div>
        </div>
        <div>
          <div className="mb-5 flex items-start justify-between"><div><div className="mb-2 flex items-center gap-2"><Github size={16} className="text-slate-400" /><span className="font-mono text-[11px] text-slate-400">acme / launchpad</span></div><h3 className="font-display text-xl font-semibold text-white">A friendly first read</h3></div><span className="pill pill-lime">AI ready</span></div>
          <div className="rounded-xl border border-violet/20 bg-violet/[0.07] p-4"><div className="mb-3 flex items-center gap-2 text-xs font-semibold text-violet-200"><BrainCircuit size={15} /> What this project does</div><p className="text-xs leading-6 text-slate-300">Launchpad is a small full-stack starter. Begin with <span className="rounded bg-white/[0.08] px-1.5 py-0.5 font-mono text-cyan">src/app.tsx</span> to see the page structure, then follow the API call into the backend.</p></div>
          <div className="mt-4 grid gap-3 sm:grid-cols-2"><div className="rounded-xl border border-white/[0.07] p-3"><p className="mb-2 text-[10px] uppercase tracking-wider text-slate-600">start here</p><p className="font-mono text-xs text-slate-300">src/app.tsx</p></div><div className="rounded-xl border border-white/[0.07] p-3"><p className="mb-2 text-[10px] uppercase tracking-wider text-slate-600">verified fact</p><p className="text-xs text-slate-300">TypeScript · 2.4k stars</p></div></div>
        </div>
      </div>
    </div>
  );
}

export function LandingPage() {
  return (
    <>
      <section className="hero-grid relative">
        <div className="container-shell relative z-10 grid items-center gap-14 py-20 lg:grid-cols-[0.95fr_1.05fr] lg:py-28">
          <div>
            <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-cyan/20 bg-cyan/[0.06] px-3 py-1.5 text-xs text-cyan"><Sparkles size={14} /> Your first pull request starts here</div>
            <h1 className="font-display text-5xl font-semibold leading-[1.04] tracking-[-0.045em] text-white sm:text-6xl lg:text-[72px]">Your AI copilot for <span className="text-gradient">open source.</span></h1>
            <p className="mt-7 max-w-xl text-lg leading-8 text-slate-400">Repository context, explained for humans. Understand unfamiliar code, decode error screenshots, and take your next contribution step with confidence.</p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row"><Link to="/doctor" className="button button-primary">Analyze a repository <ArrowRight size={17} /></Link><Link to="/screenshot" className="button button-secondary">Try screenshot explainer <ImagePlus size={17} /></Link></div>
            <div className="mt-8 flex flex-wrap gap-x-6 gap-y-3 text-xs text-slate-500"><span className="flex items-center gap-2"><Check size={14} className="text-lime" /> Public GitHub repos</span><span className="flex items-center gap-2"><Check size={14} className="text-lime" /> No code execution</span><span className="flex items-center gap-2"><Check size={14} className="text-lime" /> Honest AI states</span></div>
          </div>
          <DashboardPreview />
        </div>
      </section>

      <section id="features" className="container-shell py-24"><SectionHeading eyebrow="The useful kind of AI" title="Less guesswork. More forward motion." description="RepoReady turns the parts of open source that feel the most opaque into small, explainable next steps." /><div className="mt-12 grid gap-4 lg:grid-cols-3">{features.map(({ icon: Icon, tone, title, copy }) => <div key={title} className="feature-card"><div className={`feature-icon feature-icon-${tone}`}><Icon size={21} /></div><h3 className="mt-6 font-display text-xl font-semibold text-white">{title}</h3><p className="mt-3 text-sm leading-6 text-slate-400">{copy}</p><span className="mt-7 inline-flex items-center gap-2 text-xs font-medium text-slate-500">Explore feature <ArrowRight size={13} /></span></div>)}</div></section>

      <section id="how-it-works" className="border-y border-white/[0.05] bg-white/[0.015] py-24"><div className="container-shell"><SectionHeading eyebrow="A calmer workflow" title="From “where do I even start?” to a clear first move." description="No black-box magic. Just a clean path from context to understanding." align="center" /><div className="relative mt-14 grid gap-5 lg:grid-cols-3">{steps.map((step, index) => <div key={step.number} className="relative rounded-2xl border border-white/[0.07] bg-panel/60 p-7"><span className="font-mono text-sm text-cyan">{step.number}</span><h3 className="mt-8 font-display text-xl font-semibold text-white">{step.title}</h3><p className="mt-3 text-sm leading-6 text-slate-400">{step.copy}</p>{index < steps.length - 1 && <ArrowRight className="absolute -right-4 top-1/2 z-10 hidden rounded-full border border-white/[0.1] bg-panel p-2 text-slate-600 lg:block" size={32} />}</div>)}</div></div></section>

      <section className="container-shell py-24"><div className="grid items-end gap-10 lg:grid-cols-[1fr_auto]"><SectionHeading eyebrow="Built for the real first attempt" title="A small tool with a strong point of view." description="AI can help you orient yourself. It should never blur the line between what came from GitHub and what it inferred." /><Link to="/about" className="button button-secondary w-fit">See how it works <ArrowRight size={16} /></Link></div><div className="mt-12 grid gap-4 md:grid-cols-3"><div className="stat-card"><Code2 className="text-violet" size={20} /><p className="mt-5 font-display text-2xl font-semibold text-white">Facts first</p><p className="mt-2 text-sm leading-6 text-slate-500">Repository metadata stays grounded in GitHub’s public API.</p></div><div className="stat-card"><BrainCircuit className="text-cyan" size={20} /><p className="mt-5 font-display text-2xl font-semibold text-white">Gemma powered</p><p className="mt-2 text-sm leading-6 text-slate-500">Bring your account’s supported model through a backend-only configuration.</p></div><div className="stat-card"><Github className="text-lime" size={20} /><p className="mt-5 font-display text-2xl font-semibold text-white">Open source ready</p><p className="mt-2 text-sm leading-6 text-slate-500">Understand the shape of a project before making your first change.</p></div></div></section>
    </>
  );
}

