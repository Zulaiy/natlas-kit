import { createMDX } from "fumadocs-mdx/next";
const withMDX = createMDX();
export default withMDX({
  reactStrictMode: true,
  transpilePackages: ["natlaskit", "@natlaskit/react"],
  devIndicators: false,
});
