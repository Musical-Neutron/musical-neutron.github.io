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

// Topics and papers that aren't live yet are left out everywhere (the Research page and the
// menu): drafts, and those whose "Go live" time hasn't come (e.g. an embargoed paper).
const builtAt = new Date();
const isLive = (item) =>
  !item.draft && !(item.go_live && new Date(item.go_live) > builtAt);

export const researchTopics = data.topics.filter(isLive).map((topic) => ({
  ...topic,
  menu_links: topic.menu_links ?? [],
  papers: (topic.papers ?? []).filter(isLive).map((paper) => ({
    ...paper,
    links: (paper.links ?? []).map((link) => ({
      ...link,
      label: link.label || linkLabels[link.type] || "Link",
    })),
  })),
}));
