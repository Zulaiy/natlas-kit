import Link from "next/link";
import { Header, Footer } from "@/components/chrome";
export const metadata = { title: "Examples" };
export default function Page() {
  return (
    <>
      <Header />
      <main className="site-container">
        <div className="page-intro">
          <div className="eyebrow">FROM EXAMPLE TO APPLICATION</div>
          <h1>
            Start with
            <br />
            <span>something working.</span>
          </h1>
          <p>Small, readable integrations using the same speech API.</p>
        </div>
        <div className="demo-grid">
          {[
            {
              title: "Python backend",
              text: "Submit a recording with the Python SDK, or load the official model locally.",
              doc: "python",
              folder: "python-backend",
            },
            {
              title: "Node.js backend",
              text: "Use the TypeScript SDK with a filesystem recording and your speech endpoint.",
              doc: "typescript",
              folder: "node-backend",
            },
            {
              title: "Next.js + React",
              text: "Use a server-side proxy with the recorder, upload input, and transcription hook.",
              doc: "react",
              folder: "nextjs-transcription",
            },
          ].map((item) => (
            <article className="demo-card" key={item.title}>
              <h2>{item.title}</h2>
              <p>{item.text}</p>
              <Link className="text-link" href={`/docs/${item.doc}`}>
                Read the guide →
              </Link>
              <a
                className="text-link"
                href={`https://github.com/Zulaiy/natlas-kit/tree/main/examples/${item.folder}`}
              >
                View source ↗
              </a>
            </article>
          ))}
        </div>
      </main>
      <Footer />
    </>
  );
}
