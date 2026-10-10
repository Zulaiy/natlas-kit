import Link from "next/link";
import {
  ArrowUpRight,
  AudioLines,
  BookOpen,
  Braces,
  Cloud,
  FileCode2,
  Github,
  Layers,
  LifeBuoy,
  Mic,
  Rocket,
  Terminal,
  Users,
} from "lucide-react";
import { DocsLayout } from "fumadocs-ui/layouts/docs";
import { source } from "@/lib/source";
import { DocsHeader } from "@/components/docs-header";
const labels: Record<string, { name: string; icon: typeof BookOpen }> = {
  "/docs": { name: "Introduction", icon: BookOpen },
  "/docs/quickstart": { name: "Quickstart", icon: Rocket },
  "/docs/python": { name: "Python SDK", icon: Terminal },
  "/docs/cli": { name: "Command line", icon: Terminal },
  "/docs/typescript": { name: "TypeScript SDK", icon: Braces },
  "/docs/react": { name: "React audio kit", icon: Layers },
  "/docs/models": { name: "Language models", icon: AudioLines },
  "/docs/api": { name: "API reference", icon: FileCode2 },
  "/docs/deployment": { name: "Deployment", icon: Cloud },
  "/docs/troubleshooting": { name: "Troubleshooting", icon: LifeBuoy },
  "/docs/beta-testing": { name: "Beta testing", icon: Mic },
  "/docs/contributing": { name: "Contributing", icon: Users },
};
export default function Layout({ children }: { children: React.ReactNode }) {
  const tree = {
    ...source.pageTree,
    children: source.pageTree.children.map((node) => {
      if (node.type !== "page" || !labels[node.url]) return node;
      const { name, icon: Icon } = labels[node.url];
      return { ...node, name, icon: <Icon size={15} /> };
    }),
  };
  return (
    <DocsLayout
      tree={tree}
      themeSwitch={{ enabled: false }}
      searchToggle={{ enabled: false }}
      nav={{
        title: (
          <span className="docs-sidebar-title">
            <BookOpen size={17} />
            <span>Developer docs</span>
            <small>v0.1</small>
          </span>
        ),
        url: "/docs",
      }}
      slots={{ header: DocsHeader }}
      sidebar={{
        collapsible: false,
        footer: (
          <div className="docs-sidebar-footer">
            <Link href="/playground">
              <AudioLines size={17} />
              <div>
                <strong>Try the speech workspace</strong>
                <span>Your first recording starts here.</span>
              </div>
              <ArrowUpRight size={12} />
            </Link>
            <a href="https://github.com/Zulaiy/natlas-kit">
              <Github size={13} />
              Source & contributions <ArrowUpRight size={11} />
            </a>
          </div>
        ),
      }}
      containerProps={{
        className: "docs-shell",
        style: {
          gridTemplate:
            '"header header header header header" var(--fd-header-height) "sidebar sidebar toc-popover toc toc" var(--fd-toc-popover-height) "sidebar sidebar main toc toc" 1fr / minmax(0,1fr) var(--fd-sidebar-col) minmax(0,calc(var(--fd-layout-width) - var(--fd-sidebar-width) - var(--fd-toc-width))) var(--fd-toc-width) minmax(0,1fr)',
          "--fd-docs-row-1": "var(--fd-header-height)",
          "--fd-docs-row-2": "var(--fd-header-height)",
        } as React.CSSProperties,
      }}
    >
      {children}
    </DocsLayout>
  );
}
