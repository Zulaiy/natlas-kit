"use client";
import { useEffect, useId, useState } from "react";
import type { Language } from "natlaskit";
import { Check, Copy, ArrowUpRight } from "lucide-react";
import Link from "next/link";
export const snippets = {
  typescript: `import { NatlasClient } from 'natlaskit';\n\nconst natlas = new NatlasClient({\n  baseUrl: 'http://localhost:8000',\n});\n\nconst result = await natlas.transcribe({\n  audio: audioFile,\n  language: 'hausa',\n});\n\nconsole.log(result.text);`,
  python: `from natlaskit import NatlasClient\n\nwith NatlasClient(\n    base_url='http://localhost:8000'\n) as natlas:\n    result = natlas.transcribe(\n        'recording.wav',\n        language='hausa',\n    )\n\nprint(result.text)`,
  react: `import { useTranscription } from '@natlaskit/react';\n\nconst { transcribe, job, busy } = useTranscription({\n  baseUrl: '/api/speech',\n});\n\n// Call from your record or upload handler.\nawait transcribe(audioFile, 'hausa');\n\n// Render job?.text in your own interface.`,
};
export function CodeTabs({
  compact = false,
  language = "hausa",
}: {
  compact?: boolean;
  language?: Language;
}) {
  const id = useId();
  const [active, setActive] = useState<keyof typeof snippets>("typescript");
  const [copied, setCopied] = useState(false);
  const [copyError, setCopyError] = useState(false);
  const code = snippets[active].replaceAll("'hausa'", JSON.stringify(language));
  useEffect(() => {
    setCopied(false);
    setCopyError(false);
  }, [language]);
  async function copy() {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setCopyError(false);
    } catch {
      setCopyError(true);
    }
  }
  return (
    <div className={`code-window ${compact ? "compact" : ""}`}>
      <div className="code-tabs" role="tablist" aria-label="SDK language">
        {(["typescript", "python", "react"] as const).map((item) => (
          <button
            key={item}
            id={`${id}-tab-${item}`}
            role="tab"
            aria-selected={active === item}
            aria-controls={`${id}-code`}
            onClick={() => {
              setActive(item);
              setCopied(false);
              setCopyError(false);
            }}
          >
            {item === "typescript"
              ? "TypeScript"
              : item === "python"
                ? "Python"
                : "React"}
          </button>
        ))}
        <button className="copy-button" aria-label="Copy code" onClick={copy}>
          {copied ? <Check size={15} /> : <Copy size={15} />}
        </button>
      </div>
      <pre
        id={`${id}-code`}
        role="tabpanel"
        aria-labelledby={`${id}-tab-${active}`}
      >
        <code>
          {code.split("\n").map((line, i) => (
            <span className="code-line" key={i}>
              <span className="line-number" aria-hidden="true">
                {i + 1}
              </span>
              <span
                className={
                  line.startsWith("import") || line.startsWith("from")
                    ? "code-import"
                    : line.includes("language") ||
                        line.includes("baseUrl") ||
                        line.includes("base_url")
                      ? "code-highlight"
                      : ""
                }
              >
                {line || " "}
              </span>
            </span>
          ))}
        </code>
      </pre>
      {copyError && (
        <p role="alert">
          Select the code to copy it; clipboard access is unavailable.
        </p>
      )}
      <div className="code-footer">
        <span>One API. Your language.</span>
        <Link href="/docs/quickstart">
          View quickstart <ArrowUpRight size={14} />
        </Link>
      </div>
    </div>
  );
}
