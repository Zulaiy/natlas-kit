"use client";
import { useEffect, useRef, useState } from "react";
import { Check, Link2 } from "lucide-react";
export function CopyPageLink() {
  const [copied, setCopied] = useState(false);
  const [failed, setFailed] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );
  async function copy() {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setFailed(false);
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(() => setCopied(false), 2000);
    } catch {
      setFailed(true);
    }
  }
  return (
    <div className="docs-copy-link">
      <button onClick={copy}>
        {copied ? <Check size={13} /> : <Link2 size={13} />}{" "}
        {copied ? "Copied link" : "Copy link"}
      </button>
      {failed && <span role="alert">Copy the address from your browser.</span>}
    </div>
  );
}
