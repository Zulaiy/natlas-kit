import Link from "next/link";
import { ArrowUpRight, Github, LifeBuoy } from "lucide-react";
import { CopyPageLink } from "@/components/doc-page-actions";
import { notFound } from "next/navigation";
import {
  DocsPage,
  DocsBody,
  DocsTitle,
  DocsDescription,
} from "fumadocs-ui/page";
import { source } from "@/lib/source";
import { getMDXComponents } from "@/mdx-components";
export default async function Page({
  params,
}: {
  params: Promise<{ slug?: string[] }>;
}) {
  const { slug } = await params;
  const page = source.getPage(slug);
  if (!page) notFound();
  const MDX = page.data.body;
  return (
    <DocsPage
      className="docs-article"
      toc={page.data.toc}
      full={page.data.full}
      tableOfContent={{
        style: "clerk",
        footer: (
          <div className="docs-toc-help">
            <LifeBuoy size={15} />
            <strong>Need a hand?</strong>
            <Link href="/docs/troubleshooting">
              Troubleshooting <ArrowUpRight size={12} />
            </Link>
            <Link href="/docs/contributing">
              Improve the docs <ArrowUpRight size={12} />
            </Link>
          </div>
        ),
      }}
      footer={{ className: "docs-pagination" }}
    >
      <div className="docs-article-header">
        <div className="docs-article-meta">
          <span>
            {["python", "typescript", "react", "cli"].includes(slug?.[0] ?? "")
              ? "SDKS & COMPONENTS"
              : ["models", "api"].includes(slug?.[0] ?? "")
                ? "REFERENCE"
                : ["deployment", "troubleshooting"].includes(slug?.[0] ?? "")
                  ? "GUIDES"
                  : ["beta-testing", "contributing"].includes(slug?.[0] ?? "")
                    ? "PROJECT"
                    : "GETTING STARTED"}
          </span>
          <div>
            <CopyPageLink />
            <a
              href={`https://github.com/Zulaiy/natlas-kit/blob/main/apps/web/content/docs/${slug?.length ? slug.join("/") : "index"}.mdx`}
              target="_blank"
              rel="noreferrer"
            >
              <Github size={13} />
              Source
              <ArrowUpRight size={11} />
            </a>
          </div>
        </div>
        <DocsTitle>{page.data.title}</DocsTitle>
        <DocsDescription>{page.data.description}</DocsDescription>
      </div>
      <DocsBody className="docs-prose">
        <MDX components={getMDXComponents()} />
      </DocsBody>
    </DocsPage>
  );
}
export function generateStaticParams() {
  return source.generateParams();
}
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug?: string[] }>;
}) {
  const page = source.getPage((await params).slug);
  return {
    title: page ? `${page.data.title} — natlaskit docs` : "Documentation",
    description: page?.data.description,
  };
}
