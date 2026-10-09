import { Header, Footer } from "@/components/chrome";
import { Playground } from "@/components/playground";
import { languages, type Language } from "natlaskit";
export const metadata = { title: "Speech playground" };
export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ language?: string }>;
}) {
  const { language } = await searchParams;
  const selected: Language = languages.some((item) => item.id === language)
    ? (language as Language)
    : "english";
  return (
    <>
      <Header />
      <main className="site-container">
        <div className="page-intro">
          <div className="eyebrow">THE SPEECH PLAYGROUND</div>
          <h1>
            Your voice.
            <br />
            <span>Your next integration.</span>
          </h1>
          <p>
            Try the official N-ATLAS speech models, then take the same SDK into
            your application.
          </p>
        </div>
        <Playground initialLanguage={selected} />
      </main>
      <Footer />
    </>
  );
}
