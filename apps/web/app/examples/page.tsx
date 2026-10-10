import Link from "next/link";
import {
  ArrowUpRight,
  Braces,
  Layers,
  ShieldCheck,
  Terminal,
} from "lucide-react";
import { Header, Footer } from "@/components/chrome";
export const metadata = { title: "Examples" };
export default function Page() {
  return (
    <div className="examples-page">
      <Header />
      <main className="site-container">
        <div className="examples-intro">
          <div className="kit-breadcrumb">
            <span>Build</span>
            <span>/</span>Examples
          </div>
          <span className="site-overline">FROM EXAMPLE TO APPLICATION</span>
          <h1>
            A good starting point.
            <br />
            For your next good idea.
          </h1>
          <p>
            Small, readable integrations with the same speech API. Choose your
            stack, follow the guide, and make the experience yours.
          </p>
        </div>
        <div className="examples-grid">
          {[
            {
              title: "Python backend",
              text: "Submit a recording through the HTTP SDK or run a selected model directly on CPU.",
              doc: "python",
              folder: "python-backend",
              icon: Terminal,
              tag: "PYTHON",
              snippet: "from natlaskit import NatlasClient",
              tools: ["Python 3.11+", "HTTP client", "Local inference"],
            },
            {
              title: "Node.js backend",
              text: "Work with a typed client, a filesystem recording, and your configured speech endpoint.",
              doc: "typescript",
              folder: "node-backend",
              icon: Braces,
              tag: "TYPESCRIPT",
              snippet: "import { NatlasClient } from 'natlaskit';",
              tools: ["Node.js 22+", "TypeScript", "Job polling"],
            },
            {
              title: "Next.js + React",
              text: "A recording interface with a server proxy, waveform player, and transcription hook.",
              doc: "react",
              folder: "nextjs-transcription",
              icon: Layers,
              tag: "REACT",
              snippet: "import { useTranscription } from '@natlaskit/react';",
              tools: ["React 19", "Next.js", "Audio components"],
            },
          ].map(({ icon: Icon, ...item }) => (
            <article className="example-card" key={item.title}>
              <div className="example-art">
                <div>
                  <Icon size={24} strokeWidth={1.4} />
                  <span>{item.tag} / STARTER</span>
                </div>
                <code>{item.snippet}</code>
              </div>
              <div className="example-content">
                <h2>{item.title}</h2>
                <p>{item.text}</p>
                <div className="example-meta">
                  {item.tools.map((tool) => (
                    <span key={tool}>{tool}</span>
                  ))}
                </div>
                <div className="example-links">
                  <Link href={`/docs/${item.doc}`}>
                    Read the guide <ArrowUpRight size={12} />
                  </Link>
                  <a
                    href={`https://github.com/Zulaiy/natlas-kit/tree/main/examples/${item.folder}`}
                  >
                    View source <ArrowUpRight size={12} />
                  </a>
                </div>
              </div>
            </article>
          ))}
        </div>
        <div className="examples-note">
          <ShieldCheck size={20} />
          <div>
            <strong>Bring your own speech service.</strong>
            <p>
              These examples use your configured N-ATLAS backend. Keep
              credentials on the server and complete model access setup before
              transcription.{" "}
              <Link href="/docs/quickstart">Start with the quickstart ↗</Link>
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
