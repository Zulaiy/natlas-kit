import { Header } from "@/components/chrome";
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
    <div className="studio-page">
      <Header />
      <Playground initialLanguage={selected} />
    </div>
  );
}
