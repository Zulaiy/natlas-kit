import defaultMdxComponents from "fumadocs-ui/mdx";
import {
  DocStartCards,
  ModelRegistry,
  SourceRelease,
} from "@/components/doc-widgets";
import type { MDXComponents } from "mdx/types";
export function getMDXComponents(components?: MDXComponents) {
  return {
    ...defaultMdxComponents,
    DocStartCards,
    ModelRegistry,
    SourceRelease,
    ...components,
  };
}
export const useMDXComponents = getMDXComponents;
