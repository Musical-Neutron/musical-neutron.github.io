import getReadingTime from "reading-time";
import { toString } from "mdast-util-to-string";
import type { RehypePlugin, RemarkPlugin } from "@astrojs/markdown-remark";

export const readingTimeRemarkPlugin: RemarkPlugin = () => {
  return function (tree, file) {
    const textOnPage = toString(tree);
    const readingTime = Math.ceil(getReadingTime(textOnPage).minutes);

    if (typeof file?.data?.astro?.frontmatter !== "undefined") {
      file.data.astro.frontmatter.readingTime = readingTime;
    }
  };
};

export const responsiveTablesRehypePlugin: RehypePlugin = () => {
  return function (tree) {
    if (!tree.children) return;

    for (let i = 0; i < tree.children.length; i++) {
      const child = tree.children[i];

      if (child.type === "element" && child.tagName === "table") {
        tree.children[i] = {
          type: "element",
          tagName: "div",
          properties: {
            style: "overflow:auto",
          },
          children: [child],
        };

        i++;
      }
    }
  };
};

// Pictures in news posts load as they come into view, not all with the page
// (as on the CWEBDWARFS site).
type HastNode = {
  type: string;
  tagName?: string;
  properties?: Record<string, unknown>;
  children?: HastNode[];
};

export const lazyImagesRehypePlugin: RehypePlugin = () => {
  return function (tree) {
    const visit = (node: HastNode) => {
      if (node.type === "element" && node.tagName === "img") {
        node.properties = { ...node.properties, loading: "lazy" };
      }
      node.children?.forEach(visit);
    };
    visit(tree as unknown as HastNode);
  };
};
