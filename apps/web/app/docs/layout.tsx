import { DocsLayout } from "fumadocs-ui/layouts/docs";
import { source } from "@/lib/source";
import { Logo } from "@/components/chrome";
export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <DocsLayout
      tree={source.pageTree}
      nav={{ title: <Logo /> }}
      links={[
        { text: "Playground", url: "/playground" },
        { text: "Components", url: "/components" },
        {
          text: "GitHub",
          url: "https://github.com/Zulaiy/natlas-kit",
          external: true,
        },
      ]}
    >
      {children}
    </DocsLayout>
  );
}
