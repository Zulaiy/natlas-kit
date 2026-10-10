"use client";
import Link from "next/link";
import { ArrowUpRight, Github, Menu, Search } from "lucide-react";
import { useSearchContext } from "fumadocs-ui/contexts/search";
import { SidebarTrigger } from "fumadocs-ui/layouts/docs/slots/sidebar";
import { Logo } from "./chrome";
export function DocsHeader() {
  const { setOpenSearch } = useSearchContext();
  return (
    <header className="docs-header">
      <div className="docs-header-brand">
        <Link href="/" aria-label="natlaskit home">
          <Logo />
        </Link>
        <span>docs</span>
      </div>
      <nav aria-label="Documentation navigation">
        <Link href="/docs" aria-current="page">
          Documentation
        </Link>
        <Link href="/components">Components</Link>
        <Link href="/examples">Examples</Link>
      </nav>
      <div className="docs-header-actions">
        <button
          className="docs-search"
          onClick={() => setOpenSearch(true)}
          aria-label="Search documentation"
        >
          <Search size={15} />
          <span>Search documentation…</span>
          <kbd>Ctrl K</kbd>
        </button>
        <a
          className="docs-header-github"
          href="https://github.com/Zulaiy/natlas-kit"
          aria-label="GitHub repository"
          target="_blank"
          rel="noreferrer"
        >
          <Github size={18} />
        </a>
        <Link className="docs-playground-link" href="/playground">
          Playground <ArrowUpRight size={13} />
        </Link>
        <SidebarTrigger
          className="docs-menu-toggle"
          aria-label="Open documentation menu"
        >
          <Menu size={20} />
        </SidebarTrigger>
      </div>
    </header>
  );
}
