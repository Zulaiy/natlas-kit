import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  AudioLines,
  Braces,
  Check,
  Cpu,
  Layers,
  Mic,
  Terminal,
} from "lucide-react";
import { Header, Footer } from "@/components/chrome";
import { CodeTabs } from "@/components/code-tabs";
const bars = Array.from(
  { length: 61 },
  (_, i) =>
    14 + Math.round(Math.abs(Math.sin(i * 1.83) * Math.cos(i * 0.29)) * 79),
);
export default function Home() {
  return (
    <>
      <Header />
      <main>
        <section className="hero site-container">
          <div className="hero-copy">
            <div className="eyebrow">
              <span className="status-dot" />
              N-ATLAS, made developer-friendly
            </div>
            <h1>
              Nigerian speech.
              <br />
              <span>
                Ready to build
                <br />
                with.
              </span>
            </h1>
            <p className="hero-description">
              From a voice note to your next application. Python and TypeScript
              SDKs, React components, and a clear path to N-ATLAS.
            </p>
            <div className="hero-actions">
              <Link className="button primary" href="/docs/quickstart">
                Start building <ArrowRight size={17} />
              </Link>
              <Link className="button secondary" href="/playground">
                Try the playground <AudioLines size={17} />
              </Link>
            </div>
            <div className="hero-footnote">
              <span>
                <Check size={14} /> CPU-first development
              </span>
              <span>
                <Check size={14} /> Open-source toolkit
              </span>
            </div>
          </div>
          <div className="hero-visual">
            <div className="visual-label">
              <span className="tiny-cross">+</span> A VOICE. A LANGUAGE. A
              POSSIBILITY.
            </div>
            <div className="speech-preview">
              <div className="preview-top">
                <span>
                  <span className="status-dot" /> Speech to text
                </span>
                <span className="preview-badge">UI preview</span>
              </div>
              <div className="preview-language">
                <span className="language-tag">EN</span>
                <div>
                  <strong>Nigerian English</strong>
                  <span>N-ATLAS speech model</span>
                </div>
                <span className="model-size">~244M parameters</span>
              </div>
              <div className="waveform" aria-hidden="true">
                {bars.map((height, i) => (
                  <i
                    key={i}
                    style={{
                      height: `${height}%`,
                      opacity: 0.35 + Math.abs(Math.sin(i)) * 0.65,
                    }}
                  />
                ))}
              </div>
              <div className="audio-track">
                <span>Example recording</span>
                <span>00:12</span>
              </div>
              <div className="sample-transcript">
                <div className="sample-label">
                  ILLUSTRATIVE TRANSCRIPT <span>↳</span>
                </div>
                <p>
                  “A small idea can become something that brings people
                  together.”
                </p>
              </div>
              <Link className="preview-action" href="/playground">
                <Mic size={17} /> Bring your own voice{" "}
                <ArrowUpRight size={16} />
              </Link>
            </div>
            <div className="visual-foot">
              <span className="mono">input: audio → output: possibility</span>
              <span>01 / 04</span>
            </div>
            <div className="floating-token">
              <Braces size={16} />
              <span>built for your stack</span>
            </div>
          </div>
        </section>
        <section className="language-strip">
          <div className="site-container language-strip-inner">
            <span className="small-label">
              ONE TOOLKIT.
              <br />
              FOUR LANGUAGE MODELS.
            </span>
            {[
              { name: "Hausa", word: "HA" },
              { name: "Yoruba", word: "YO" },
              { name: "Igbo", word: "IG" },
              { name: "Nigerian English", word: "EN" },
            ].map((item) => (
              <Link
                key={item.word}
                href={`/playground?language=${item.word === "HA" ? "hausa" : item.word === "YO" ? "yoruba" : item.word === "IG" ? "igbo" : "english"}`}
              >
                <span>{item.word}</span>
                {item.name}
                <ArrowUpRight size={14} />
              </Link>
            ))}
          </div>
        </section>
        <section className="section site-container build-section" id="sdk">
          <div className="section-intro">
            <div className="eyebrow">LESS SETUP. MORE BUILDING.</div>
            <h2>
              Your first transcript.
              <br />
              Then your next big thing.
            </h2>
            <p>
              A familiar interface for the official N-ATLAS speech models.
              Connect your service, pick a language, and put the transcript to
              work.
            </p>
            <div className="numbered-step">
              <span>01</span>
              <div>
                <strong>Connect your speech service</strong>
                <p>
                  Run the CPU backend locally or point to your own deployment.
                </p>
              </div>
            </div>
            <div className="numbered-step">
              <span>02</span>
              <div>
                <strong>Use the SDK you know</strong>
                <p>
                  Python for your backend. TypeScript across your application.
                </p>
              </div>
            </div>
            <div className="numbered-step">
              <span>03</span>
              <div>
                <strong>Make it yours</strong>
                <p>
                  Add recording, uploads, and transcripts with React components.
                </p>
              </div>
            </div>
            <Link className="text-link" href="/docs/quickstart">
              Read the quickstart <ArrowRight size={16} />
            </Link>
          </div>
          <CodeTabs />
        </section>
        <section className="component-section">
          <div className="site-container">
            <div className="section-heading">
              <div>
                <div className="eyebrow">A HEAD START FOR YOUR INTERFACE</div>
                <h2>
                  Good components.
                  <br />
                  Great starting points.
                </h2>
              </div>
              <Link className="button secondary" href="/components">
                Explore components <ArrowUpRight size={16} />
              </Link>
            </div>
            <div className="component-grid">
              <Link href="/components#recorder" className="component-card">
                <div className="component-art recorder-art">
                  <div className="mic-circle">
                    <Mic size={24} />
                  </div>
                  <span className="mini-wave">▁ ▃ ▆ ▄ █ ▅ ▂ ▅ ▇ ▃ ▁</span>
                  <span className="art-tag">record → transcribe</span>
                </div>
                <div className="card-caption">
                  <div>
                    <h3>Audio recorder</h3>
                    <p>Permission, recording, and playback.</p>
                  </div>
                  <ArrowUpRight size={18} />
                </div>
              </Link>
              <Link href="/components#transcript" className="component-card">
                <div className="component-art transcript-art">
                  <div className="mini-transcript">
                    <span className="small-label">TRANSCRIPT</span>
                    <p>
                      Your words,
                      <br />
                      in your interface
                      <span className="cursor-block" />.
                    </p>
                    <span className="mini-copy">Copy text ↗</span>
                  </div>
                </div>
                <div className="card-caption">
                  <div>
                    <h3>Transcript panel</h3>
                    <p>Processing states and copy controls.</p>
                  </div>
                  <ArrowUpRight size={18} />
                </div>
              </Link>
              <Link href="/docs/react" className="component-card">
                <div className="component-art hooks-art">
                  <div className="hook-code">
                    <span>const</span> {"{ transcribe }"}
                    <br /> = <strong>useTranscription</strong>({"{"}
                    <br /> &nbsp; baseUrl: <em>'/api/speech'</em>
                    <br />
                    {"}"});
                  </div>
                  <span className="art-tag">your UI. our hooks.</span>
                </div>
                <div className="card-caption">
                  <div>
                    <h3>Composable hooks</h3>
                    <p>The behaviour, without the styling.</p>
                  </div>
                  <ArrowUpRight size={18} />
                </div>
              </Link>
            </div>
          </div>
        </section>
        <section className="section site-container principles">
          <div>
            <div className="eyebrow">MADE FOR THE WAY YOU BUILD</div>
            <h2>
              Local first.
              <br />
              Possibilities everywhere.
            </h2>
          </div>
          <div className="principle-list">
            {[
              {
                icon: Cpu,
                title: "A practical CPU starting point",
                body: "Start with short recordings and one model. Our guides explain model access, memory, and deployment.",
              },
              {
                icon: Terminal,
                title: "One path from example to application",
                body: "The playground uses the same SDKs and components you install. Take the code into your own project.",
              },
              {
                icon: Layers,
                title: "An open foundation to extend",
                body: "A shared API contract, readable source, and contribution guides make the toolkit yours to build on.",
              },
            ].map(({ icon: Icon, title, body }) => (
              <div className="principle" key={title}>
                <Icon size={22} />
                <div>
                  <h3>{title}</h3>
                  <p>{body}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
        <section className="site-container final-cta">
          <div>
            <span className="eyebrow">FROM HERE, IT'S YOURS.</span>
            <h2>
              Build something
              <br />
              that speaks to home.
            </h2>
            <p>Start with one recording. See where it takes you.</p>
          </div>
          <Link className="button dark" href="/docs/quickstart">
            Get started with natlaskit <ArrowRight size={18} />
          </Link>
        </section>
      </main>
      <Footer />
    </>
  );
}
