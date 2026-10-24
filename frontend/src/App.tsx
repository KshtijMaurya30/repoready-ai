import { useState } from "react";
import { ArrowUpRight, Menu, X } from "lucide-react";
import { Link, NavLink, Outlet } from "react-router-dom";
import { Logo } from "./components/Logo";

const navItems = [
  { label: "Features", href: "/#features" },
  { label: "How it works", href: "/#how-it-works" },
  { label: "About", href: "/about" },
];

export default function App() {
  const [open, setOpen] = useState(false);

  return (
    <div className="min-h-screen overflow-x-hidden bg-ink text-slate-100">
      <div className="site-noise" aria-hidden="true" />
      <header className="sticky top-0 z-30 border-b border-white/[0.06] bg-ink/80 backdrop-blur-xl">
        <div className="container-shell flex h-[76px] items-center justify-between">
          <Link to="/" onClick={() => setOpen(false)}><Logo /></Link>
          <nav className="hidden items-center gap-8 md:flex" aria-label="Main navigation">
            {navItems.map((item) => (
              <a key={item.label} href={item.href} className="nav-link">{item.label}</a>
            ))}
          </nav>
          <div className="hidden items-center gap-3 sm:flex">
            <Link to="/doctor" className="button button-primary button-small">Analyze a repo <ArrowUpRight size={15} /></Link>
          </div>
          <button className="icon-button md:hidden" onClick={() => setOpen((value) => !value)} aria-label="Toggle navigation">
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
        {open && (
          <nav className="container-shell border-t border-white/[0.06] py-4 md:hidden" aria-label="Mobile navigation">
            {navItems.map((item) => (
              <a key={item.label} href={item.href} onClick={() => setOpen(false)} className="block border-b border-white/[0.05] py-3 text-sm text-slate-300">{item.label}</a>
            ))}
            <Link to="/doctor" onClick={() => setOpen(false)} className="button button-primary mt-4 w-full">Analyze a repo <ArrowUpRight size={15} /></Link>
          </nav>
        )}
      </header>
      <main><Outlet /></main>
      <footer className="border-t border-white/[0.06] py-10">
        <div className="container-shell flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3"><Logo compact /><span className="text-sm text-slate-500">Understand code. Fix errors. Contribute with confidence.</span></div>
          <div className="flex items-center gap-5 text-sm text-slate-500"><Link to="/about" className="hover:text-white">About</Link><a href="https://github.com" target="_blank" rel="noreferrer" className="hover:text-white">GitHub <ArrowUpRight className="inline" size={13} /></a><span>MIT licensed</span></div>
        </div>
      </footer>
    </div>
  );
}

