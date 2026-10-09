import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Header, Footer } from "@/components/chrome";
import { ComponentDemos } from "@/components/component-demos";
export const metadata = { title: "React components" };
export default function Page() {
  return (
    <>
      <Header />
      <main className="site-container">
        <div className="page-intro">
          <div className="eyebrow">THE BUILDING BLOCKS</div>
          <h1>
            A little less setup.
            <br />
            <span>A lot more you.</span>
          </h1>
          <p>
            Composable React components for speech interfaces. Try them here,
            then use the same package in your application.
          </p>
          <Link className="text-link" href="/docs/react">
            Installation and API guide <ArrowRight size={16} />
          </Link>
        </div>
        <ComponentDemos />
      </main>
      <Footer />
    </>
  );
}
