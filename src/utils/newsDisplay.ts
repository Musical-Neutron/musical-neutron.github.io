// src/utils/newsDisplay.ts
import { APP_BLOG } from "astrowind:config";
import { fetchPosts } from "./blog";
import { getBlogPermalink } from "./permalinks";
import type { Post } from "~/types";

export interface NewsDisplayState {
  posts: Post[];
  hasAnyPosts: boolean;
  hasFreshPosts: boolean;
  newestAgeDays: number;
  hideNewsTopLevel: boolean;
  latestForIndex: Post[];
  latestForSidebar: Post[];
  newsListHref: string;
}

/**
 * Shared logic for deciding how "News" should be displayed.
 * Uses thresholds from APP_BLOG.latest in config.yaml.
 */
export const getNewsDisplayState = async (): Promise<NewsDisplayState> => {
  const latestCfg = APP_BLOG.latest ?? {};
  const freshnessDays = latestCfg.freshnessDays ?? 90; // X
  const maxAgeDays = latestCfg.maxAgeDays ?? 365; // Z
  const minCount = latestCfg.minCount ?? 4; // index widget count
  const sidebarCount = latestCfg.sidebarCount ?? 3; // sidebar links
  const newsButtonMaxAgeDays = latestCfg.newsButtonMaxAgeDays ?? 730; // Y (add to config.yaml)

  const dayMs = 1000 * 60 * 60 * 24;
  const now = new Date();

  const posts = APP_BLOG.isEnabled ? await fetchPosts() : [];
  const hasAnyPosts = posts.length > 0;

  const freshPosts = posts.filter(
    (post) =>
      now.getTime() - post.publishDate.getTime() <= freshnessDays * dayMs,
  );
  const hasFreshPosts = freshPosts.length > 0;

  const newestAgeDays = hasAnyPosts
    ? (now.getTime() - posts[0].publishDate.getTime()) / dayMs
    : Infinity;

  // Same notion as "no News button / no top-level News"
  const hideNewsTopLevel =
    !hasFreshPosts && (!hasAnyPosts || newestAgeDays > newsButtonMaxAgeDays);

  // Posts not older than maxAgeDays
  const ageFilteredPosts = posts.filter(
    (post) => now.getTime() - post.publishDate.getTime() <= maxAgeDays * dayMs,
  );

  const latestForIndex = ageFilteredPosts.slice(0, minCount);
  const latestForSidebar = ageFilteredPosts.slice(0, sidebarCount);

  const newsListHref = getBlogPermalink();

  return {
    posts,
    hasAnyPosts,
    hasFreshPosts,
    newestAgeDays,
    hideNewsTopLevel,
    latestForIndex,
    latestForSidebar,
    newsListHref,
  };
};
