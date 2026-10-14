// The research topics and papers live in research.json, which the editor at /admin/ can change.
// This file fills in the defaults the pages rely on.
import data from "./research.json";

// Link text used when a paper link has no label of its own.
const linkLabels = {
  journal: "Journal",
  arxiv: "arXiv",
  ads: "ADS",
  zenodo: "Zenodo",
  github: "GitHub",
};

export const researchTopics = data.topics.map((topic) => ({
  ...topic,
  menu_links: topic.menu_links ?? [],
  papers: (topic.papers ?? []).map((paper) => ({
    ...paper,
    links: (paper.links ?? []).map((link) => ({
      ...link,
      label: link.label || linkLabels[link.type] || "Link",
    })),
  })),
}));
