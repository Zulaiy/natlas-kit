import Link from "next/link";
import { ArrowRight, ArrowUpRight, Github } from "lucide-react";
import { SiteNavigation } from "./site-navigation";
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
        <SiteNavigation />
        <div className="site-header-actions">
          <a
            className="site-github"
            href="https://github.com/Zulaiy/natlas-kit"
            target="_blank"
            rel="noreferrer"
            aria-label="GitHub repository"
          >
            <Github size={19} />
          </a>
          <Link className="site-start-button" href="/docs/quickstart">
            Start building <ArrowRight size={14} />
          </Link>
        </div>
      </div>
    </header>
  );
}
export function Footer() {
  return (
    <footer className="site-footer">
      <div className="site-container">
        <div className="site-footer-main">
          <div className="site-footer-brand">
            <Link href="/" aria-label="natlaskit home">
              <Logo />
            </Link>
            <p>
              Tools for the languages
              <br />
              we call home.
            </p>
            <span className="site-footer-license">
              <i />
              Independent toolkit · MIT licensed
            </span>
          </div>
          <div className="site-footer-column">
            <span>EXPLORE</span>
            <Link href="/playground">Speech playground</Link>
            <Link href="/components">Audio components</Link>
            <Link href="/examples">Example applications</Link>
          </div>
          <div className="site-footer-column">
            <span>BUILD</span>
            <Link href="/docs/quickstart">Quickstart</Link>
            <Link href="/docs/python">Python SDK</Link>
            <Link href="/docs/typescript">TypeScript SDK</Link>
            <Link href="/docs/api">API reference</Link>
          </div>
          <div className="site-footer-column">
            <span>PROJECT</span>
            <a href="https://github.com/Zulaiy/natlas-kit">
              GitHub <ArrowUpRight size={12} />
            </a>
            <Link href="/docs/contributing">Contributing</Link>
            <Link href="/docs/models">Official models</Link>
          </div>
        </div>
        <div className="site-footer-bottom">
          <span>Built for Nigerian speech.</span>
          <p>
            natlaskit is an independent developer toolkit. N-ATLAS models retain
            their own access and licensing terms.
          </p>
          <span>natlaskit / v0.1</span>
        </div>
      </div>
    </footer>
  );
}
