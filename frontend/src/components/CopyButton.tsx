import { Check, Copy } from "lucide-react";
import { useState } from "react";

export function CopyButton({ value, label = "Copy" }: { value: string; label?: string }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  }

  return (
    <button type="button" onClick={copy} className="icon-button" aria-label={label} title={label}>
      {copied ? <Check size={15} className="text-lime" /> : <Copy size={15} />}
      <span className="hidden sm:inline">{copied ? "Copied" : label}</span>
    </button>
  );
}

