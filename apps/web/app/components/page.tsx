import Link from "next/link";
import { ArrowUpRight, Braces } from "lucide-react";
import { Header, Footer } from "@/components/chrome";
import { ComponentDemos } from "@/components/component-demos";
export const metadata = { title: "Audio components" };
export default function Page() {
  return (
    <div className="kit-page">
      <Header />
      <main className="kit-container">
        <div className="kit-breadcrumb">
          <span>Build</span>
          <span>/</span>Component library
        </div>
        <div className="kit-page-heading">
          <div>
            <span className="kit-overline">
              <Braces size={13} /> THE AUDIO INTERFACE KIT
            </span>
            <h1>
              Good interfaces start
              <br />
              with great components.
            </h1>
            <p>
              Expressive, composable audio components for N-ATLAS.
              <br />
              Built to feel at home in your next application.
            </p>
          </div>
          <div className="kit-heading-side">
            <div className="kit-version">
              <i />
              React 19<span>MIT licensed</span>
            </div>
            <Link href="/docs/react">
              Get started <ArrowUpRight size={14} />
            </Link>
          </div>
        </div>
        <ComponentDemos />
      </main>
      <Footer />
    </div>
  );
}
