import type { Metadata } from "next";
import { RootProvider } from "fumadocs-ui/provider/next";
import "./globals.css";
import "./marketing.css";
import "./docs.css";
import "@natlaskit/react/styles.css";
export const metadata: Metadata = {
  title: {
    default: "natlaskit — Nigerian speech, ready to build with.",
    template: "%s | natlaskit",
  },
  description:
    "Python and TypeScript SDKs, React components, and practical documentation for building with N-ATLAS speech recognition.",
};
export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" data-scroll-behavior="smooth" suppressHydrationWarning>
      <body>
        <RootProvider theme={{ forcedTheme: "light", enableSystem: false }}>
          {children}
        </RootProvider>
      </body>
    </html>
  );
}
