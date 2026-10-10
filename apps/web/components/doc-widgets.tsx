import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  AudioLines,
  Braces,
  Check,
  Layers,
  Terminal,
} from "lucide-react";
import { languages } from "natlaskit";
export function DocStartCards() {
  return (
    <div className="docs-start-cards not-prose">
      <Link className="docs-quickstart-card" href="/docs/quickstart">
        <span>
          <Terminal size={20} />
        </span>
        <div>
          <h3>Your first transcription</h3>
          <p>Connect the speech service and turn a recording into text.</p>
        </div>
        <ArrowRight size={19} />
      </Link>
      <div className="docs-sdk-cards">
        {[
          {
            href: "/docs/python",
            icon: Terminal,
            title: "Python SDK",
            body: "HTTP integration and local CPU inference.",
            tag: "PYTHON",
          },
          {
            href: "/docs/typescript",
            icon: Braces,
            title: "TypeScript SDK",
            body: "A typed client for Node.js and the web.",
            tag: "TYPESCRIPT",
          },
          {
            href: "/docs/react",
            icon: Layers,
            title: "React audio kit",
            body: "Recording, playback, and transcript UI.",
            tag: "REACT",
          },
        ].map(({ href, icon: Icon, title, body, tag }) => (
          <Link key={href} href={href}>
            <div>
              <Icon size={19} />
              <ArrowUpRight size={14} />
            </div>
            <span>{tag}</span>
            <h3>{title}</h3>
            <p>{body}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
export function ModelRegistry() {
  return (
    <div className="docs-model-grid not-prose">
      {languages.map((item) => (
        <a
          key={item.id}
          href={`https://huggingface.co/${item.model}`}
          target="_blank"
          rel="noreferrer"
        >
          <div>
            <span className="docs-model-code">{item.code}</span>
            <span className="docs-model-official">
              <Check size={10} />
              Official model
            </span>
            <ArrowUpRight size={14} />
          </div>
          <h3>
            {item.id === "english" ? "Nigerian-accented English" : item.label}
          </h3>
          <span className="docs-model-id">{item.model}</span>
          <div className="docs-model-bottom">
            <span>
              <AudioLines size={12} />
              Speech recognition
            </span>
            <code>{item.id}</code>
          </div>
        </a>
      ))}
    </div>
  );
}
export function SourceRelease() {
  return (
    <div className="docs-release-note not-prose">
      <span className="docs-release-dot" />
      <div>
        <strong>A source release, ready to build with.</strong>
        <p>
          Build the packages from the repository or install local tarballs. Live
          transcription requires authorised model access and a configured speech
          service.
        </p>
      </div>
    </div>
  );
}
