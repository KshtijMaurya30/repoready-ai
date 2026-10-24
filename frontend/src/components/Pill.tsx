export function Pill({ children, tone = "violet" }: { children: React.ReactNode; tone?: "violet" | "cyan" | "lime" | "muted" }) {
  return <span className={`pill pill-${tone}`}>{children}</span>;
}

