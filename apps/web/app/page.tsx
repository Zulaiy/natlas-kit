import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  AudioLines,
  BookOpen,
  Braces,
  Check,
  Code2,
  Cpu,
  FileText,
  Layers,
  Mic,
  Terminal,
  Waves,
} from "lucide-react";
import { Header, Footer } from "@/components/chrome";
import { CodeTabs } from "@/components/code-tabs";
import { HomePreview } from "@/components/home-preview";
import { languages } from "natlaskit";
const visualBars = [
  12, 17, 29, 41, 32, 16, 12, 24, 40, 61, 77, 59, 38, 19, 13, 28, 45, 63, 87,
  75, 51, 35, 23, 12, 20, 37, 58, 71, 48, 31, 15, 10, 25, 39, 57, 71, 49, 33,
  17, 12,
];
export default function Home() {
  return (
    <div className="marketing-page">
      <Header />
      <main id="main-content">
        <section className="home-hero site-container">
          <div className="home-hero-copy">
            <Link className="home-announcement" href="/components">
              <span>NEW</span>The audio interface kit <ArrowUpRight size={12} />
            </Link>
            <h1>
              Build for the way
              <br />
              Nigeria <span>speaks.</span>
            </h1>
            <p>
              The building blocks for Nigerian speech. Python and TypeScript
              SDKs, expressive React components, and a clear path from your
              first recording to your next application.
            </p>
            <div className="home-hero-actions">
              <Link className="button primary" href="/docs/quickstart">
                Start building <ArrowRight size={16} />
              </Link>
              <Link className="button secondary" href="/playground">
                Explore the playground <AudioLines size={16} />
              </Link>
            </div>
            <div className="home-hero-meta">
              <span>
                <Check size={12} />
                MIT licensed code
              </span>
              <span>
                <Check size={12} />
                Your backend. Your application.
              </span>
            </div>
            <div className="home-stack-label">
              <span>BUILT FOR YOUR STACK</span>
              <span>Python</span>
              <span>TypeScript</span>
              <span>React</span>
            </div>
          </div>
          <HomePreview />
        </section>
        <section className="home-languages">
          <div className="site-container">
            <div className="home-language-intro">
              <span className="site-overline">CLOSER TO HOME</span>
              <p>
                Four languages.
                <br />
                One familiar interface.
              </p>
            </div>
            {languages.map((item) => (
              <Link key={item.id} href={`/playground?language=${item.id}`}>
                <span className="home-language-code">{item.code}</span>
                <span>
                  {item.label}
                  <small>Official N-ATLAS speech model</small>
                </span>
                <ArrowUpRight size={13} />
              </Link>
            ))}
          </div>
        </section>
        <section className="home-sdk-section site-container" id="sdk">
          <div className="home-section-copy">
            <span className="site-overline">
              <Braces size={13} /> FROM AUDIO TO APPLICATION
            </span>
            <h2>
              A familiar API.
              <br />A world of possibilities.
            </h2>
            <p>
              Choose your language and connect your speech service. The SDK
              handles uploads and job status, so you can focus on what your
              application does next.
            </p>
            <div className="home-sdk-links">
              {[
                {
                  title: "Python SDK",
                  text: "Backend integration and local CPU inference.",
                  href: "/docs/python",
                  icon: Terminal,
                },
                {
                  title: "TypeScript SDK",
                  text: "A typed client for Node.js and web applications.",
                  href: "/docs/typescript",
                  icon: Code2,
                },
                {
                  title: "React components",
                  text: "The interaction layer, ready to make your own.",
                  href: "/docs/react",
                  icon: Layers,
                },
              ].map(({ title, text, href, icon: Icon }) => (
                <Link key={href} href={href}>
                  <span>
                    <Icon size={17} />
                  </span>
                  <div>
                    <strong>{title}</strong>
                    <p>{text}</p>
                  </div>
                  <ArrowUpRight size={14} />
                </Link>
              ))}
            </div>
          </div>
          <div className="home-sdk-window">
            <div className="home-window-label">
              <span>
                <Terminal size={12} />
                YOUR FIRST INTEGRATION
              </span>
              <span>01 / SDK</span>
            </div>
            <CodeTabs />
            <div className="home-sdk-note">
              <i />
              Same SDK. Same models. In the playground and your app.
            </div>
          </div>
        </section>
        <section className="home-components-section">
          <div className="site-container">
            <div className="home-section-heading">
              <div>
                <span className="site-overline">
                  THE DETAILS MAKE THE DIFFERENCE
                </span>
                <h2>
                  Sound deserves
                  <br />a beautiful interface.
                </h2>
              </div>
              <div>
                <p>
                  Audio controls that feel considered.
                  <br />
                  Composable, accessible, and ready for your app.
                </p>
                <Link className="text-link" href="/components">
                  Explore the component library <ArrowUpRight size={14} />
                </Link>
              </div>
            </div>
            <div className="home-component-grid">
              <Link className="home-component-tile" href="/components#recorder">
                <div className="home-component-canvas home-capture-art">
                  <span className="home-art-label">CAPTURE / PREVIEW</span>
                  <div className="home-mic-orbit">
                    <Mic size={27} strokeWidth={1.4} />
                  </div>
                  <div className="home-mini-wave" aria-hidden="true">
                    {visualBars.map((height, i) => (
                      <i key={i} style={{ height: height * 0.38 }} />
                    ))}
                  </div>
                  <span className="home-art-caption">
                    A voice note is a beginning.
                  </span>
                </div>
                <div className="home-component-caption">
                  <span>01</span>
                  <div>
                    <h3>Capture the moment</h3>
                    <p>Live levels, input selection, pause and resume.</p>
                  </div>
                  <ArrowUpRight size={18} />
                </div>
              </Link>
              <Link
                className="home-component-tile"
                href="/components#audio-player"
              >
                <div className="home-component-canvas home-playback-art">
                  <span className="home-art-label">PLAYBACK / PREVIEW</span>
                  <div className="home-wave-sculpture" aria-hidden="true">
                    {visualBars.map((height, i) => (
                      <i
                        key={i}
                        style={{
                          height: height * 0.95,
                          background: i < 16 ? "#17755a" : undefined,
                        }}
                      />
                    ))}
                  </div>
                  <div className="home-playback-time">
                    <span>00:03</span>
                    <span>Sound, in focus.</span>
                    <span>00:08</span>
                  </div>
                </div>
                <div className="home-component-caption">
                  <span>02</span>
                  <div>
                    <h3>Find your moment</h3>
                    <p>Waveform seeking, playback speed, and mute.</p>
                  </div>
                  <ArrowUpRight size={18} />
                </div>
              </Link>
              <Link
                className="home-component-tile"
                href="/components#transcript"
              >
                <div className="home-component-canvas home-output-art">
                  <span className="home-art-label">TRANSCRIPT / PREVIEW</span>
                  <div className="home-transcript-paper">
                    <FileText size={17} />
                    <p>
                      Every voice
                      <br />
                      carries a <span>possibility.</span>
                    </p>
                    <small>ILLUSTRATIVE TEXT</small>
                  </div>
                </div>
                <div className="home-component-caption">
                  <span>03</span>
                  <div>
                    <h3>Put words to work</h3>
                    <p>Readable results, JSON, copy, and download.</p>
                  </div>
                  <ArrowUpRight size={18} />
                </div>
              </Link>
            </div>
            <div className="home-component-foot">
              <span>
                <Waves size={14} />
                Light and dark styles included.
              </span>
              <span>React 19 · CSS variables · Reduced motion</span>
            </div>
          </div>
        </section>
        <section className="home-path-section site-container">
          <div className="home-section-heading">
            <div>
              <span className="site-overline">
                A CLEAR PATH TO SOMETHING REAL
              </span>
              <h2>
                Start small.
                <br />
                Build something yours.
              </h2>
            </div>
            <Link className="text-link" href="/docs/quickstart">
              Follow the quickstart <ArrowRight size={14} />
            </Link>
          </div>
          <div className="home-path-grid">
            {[
              {
                number: "01",
                icon: Cpu,
                title: "Connect your speech service",
                body: "Run the Python backend on CPU. Our guides cover model access, configuration, and your first short recording.",
                href: "/docs/quickstart",
              },
              {
                number: "02",
                icon: Braces,
                title: "Integrate with your stack",
                body: "Use Python or TypeScript to submit audio and retrieve a transcript through the same API contract.",
                href: "/examples",
              },
              {
                number: "03",
                icon: Layers,
                title: "Make the experience yours",
                body: "Bring the audio components into your app. Keep credentials on your server and build around the result.",
                href: "/docs/react",
              },
            ].map(({ number, icon: Icon, title, body, href }) => (
              <Link key={number} href={href}>
                <div>
                  <span>{number}</span>
                  <Icon size={20} />
                </div>
                <h3>{title}</h3>
                <p>{body}</p>
                <span className="home-path-arrow">
                  <ArrowUpRight size={15} />
                </span>
              </Link>
            ))}
          </div>
        </section>
        <section className="home-docs-banner site-container">
          <span className="home-docs-icon">
            <BookOpen size={27} strokeWidth={1.3} />
          </span>
          <div>
            <span className="site-overline">
              GOOD DOCUMENTATION IS PART OF THE TOOLKIT
            </span>
            <h2>
              A place to start.
              <br />
              And a guide for what’s next.
            </h2>
            <p>
              Quickstarts, SDK guides, model references, and working examples.
            </p>
          </div>
          <Link className="button secondary" href="/docs">
            Read the documentation <ArrowUpRight size={16} />
          </Link>
        </section>
        <section className="home-faq site-container">
          <div>
            <span className="site-overline">BEFORE YOU BUILD</span>
            <h2>A few useful answers.</h2>
            <p>
              More detail in the{" "}
              <Link href="/docs">
                developer docs <ArrowUpRight size={11} />
              </Link>
              .
            </p>
          </div>
          <div>
            {[
              {
                q: "What can I build with natlaskit?",
                a: "Speech recognition applications using the official N-ATLAS models for Hausa, Yoruba, Igbo, and Nigerian-accented English. The toolkit includes Python and TypeScript SDKs, a CPU service, and React audio components.",
              },
              {
                q: "Can I get started on a CPU?",
                a: "The Python speech service supports CPU inference. Start with recordings up to 30 seconds and one language model. Memory requirements and processing time depend on the model and your machine; performance has not yet been benchmarked.",
              },
              {
                q: "Are the packages on npm and PyPI?",
                a: "This is currently a source release. Build from the repository or install the locally packed packages. The quickstart walks through the setup.",
              },
              {
                q: "Do I need access to the models?",
                a: "Yes. Accept the selected model’s terms on Hugging Face and configure your access token in the speech service. Model access and licensing are separate from the toolkit’s MIT licence.",
              },
            ].map((item) => (
              <details key={item.q}>
                <summary>
                  {item.q}
                  <span>+</span>
                </summary>
                <p>{item.a}</p>
              </details>
            ))}
          </div>
        </section>
        <section className="home-final-cta site-container">
          <div>
            <span className="site-overline">YOUR NEXT IDEA STARTS HERE</span>
            <h2>
              Build something
              <br />
              closer to home.
            </h2>
            <p>The languages are ours. The possibilities are yours.</p>
            <Link className="button" href="/docs/quickstart">
              Get started with natlaskit <ArrowRight size={16} />
            </Link>
          </div>
          <div className="home-cta-wave" aria-hidden="true">
            {visualBars.map((height, i) => (
              <i key={i} style={{ height: height * 2.2 }} />
            ))}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
