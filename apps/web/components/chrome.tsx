import Link from "next/link";
import { ArrowUpRight, Github } from "lucide-react";
export function Logo() {
  return (
    <span className="brand">
      <span className="brand-icon" aria-hidden="true">
        <i />
        <i />
        <i />
        <i />
        <i />
      </span>
      natlaskit<span className="brand-dot">.</span>
    </span>
  );
}
export function Header() {
  return (
    <header className="site-header">
      <div className="site-container nav">
        <Link href="/" aria-label="natlaskit home">
          <Logo />
        </Link>
        <nav aria-label="Main navigation">
          <Link href="/docs">Documentation</Link>
          <Link href="/components">Components</Link>
          <Link href="/playground">Playground</Link>
        </nav>
        <a
          className="github-link"
          href="https://github.com/Zulaiy/natlas-kit"
          target="_blank"
          rel="noreferrer"
        >
          <Github size={17} />
          <span>GitHub</span>
          <ArrowUpRight size={14} />
        </a>
      </div>
    </header>
  );
}
export function Footer() {
  return (
    <footer className="site-footer site-container">
      <div>
        <Link href="/">
          <Logo />
        </Link>
        <p>Built for the languages we call home.</p>
      </div>
      <div className="footer-links">
        <Link href="/docs">Docs</Link>
        <Link href="/playground">Playground</Link>
        <a href="https://github.com/Zulaiy/natlas-kit">
          Contribute <ArrowUpRight size={13} />
        </a>
      </div>
      <p className="attribution">
        N-ATLaS is an initiative of the Federal Ministry of Communications,
        Innovation and Digital Economy, and powered by Awarri Technologies.
        natlaskit is an independent developer toolkit.
      </p>
    </footer>
  );
}
