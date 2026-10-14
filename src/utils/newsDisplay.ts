// When and where news appears, decided in one place for the home page, the sidebar and the
// mobile menu. The thresholds are under apps.blog.latest in src/config.yaml.
//
// - While at least one post is newer than freshnessDays, the home page shows the "Latest news"
//   section (above About) and a News button that scrolls to it, and News is the first link
//   under Home in the menus.
// - Otherwise the section and the button are hidden, and News is the last link under Home.
//
// Posts older than maxAgeDays are never listed on the home page; the News page itself always
// lists every post.
import { APP_BLOG } from "astrowind:config";
import type { Post } from "~/types";
import { fetchPosts } from "./blog";
import { getBlogPermalink } from "./permalinks";

export interface NewsDisplayState {
  // At least one post is newer than freshnessDays
  isFresh: boolean;
  // Posts for the "Latest news" section on the home page (empty when not fresh)
  homePosts: Post[];
}

const dayMs = 1000 * 60 * 60 * 24;

export const getNewsDisplayState = async (
  now: Date = new Date(),
): Promise<NewsDisplayState> => {
  const {
    freshnessDays = 90,
    maxAgeDays = 365,
    minCount = 4,
  } = APP_BLOG.latest ?? {};
  const posts = APP_BLOG.isEnabled ? await fetchPosts() : [];
  const ageDays = (post: Post) =>
    (now.getTime() - post.publishDate.getTime()) / dayMs;

  const isFresh = posts.some((post) => ageDays(post) <= freshnessDays);
  const recentPosts = isFresh
    ? posts.filter((post) => ageDays(post) <= maxAgeDays)
    : [];

  return {
    isFresh,
    homePosts: recentPosts.slice(0, minCount),
  };
};

export interface MenuLink {
  text?: string;
  href?: string;
  links?: MenuLink[];
}

/**
 * Puts "News" under "Home" in the menus: first in Home's list while news is fresh, last
 * otherwise.
 */
export const arrangeNewsMenu = <T extends MenuLink>(
  links: T[],
  news: NewsDisplayState,
): MenuLink[] => {
  if (!APP_BLOG.isEnabled) return links;
  const newsLink: MenuLink = { text: "News", href: getBlogPermalink() };
  return links
    .filter((item) => item.text !== "News")
    .map((item) => {
      if (item.text !== "Home") return item;
      const children = (item.links ?? []).filter(
        (child) => child.text !== "News",
      );
      return {
        ...item,
        links: news.isFresh ? [newsLink, ...children] : [...children, newsLink],
      };
    });
};
