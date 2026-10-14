// When and where news appears, decided in one place for the home page, the sidebar and the
// mobile menu. The thresholds are under apps.blog.latest in src/config.yaml.
//
// - While at least one post is newer than freshnessDays, the home page shows the "Latest news"
//   section (above About) and a News button that scrolls to it, and News is the first item in
//   the menus, listing the latest posts.
// - Otherwise the section and the button are hidden, and News moves under Home in the menus.
//
// Posts older than maxAgeDays are never listed on the home page or in the menus; the News page
// itself always lists every post.
import { APP_BLOG } from "astrowind:config";
import type { Post } from "~/types";
import { fetchPosts } from "./blog";
import { getBlogPermalink, getPermalink } from "./permalinks";

export interface NewsDisplayState {
  // At least one post is newer than freshnessDays
  isFresh: boolean;
  // Posts for the "Latest news" section on the home page (empty when not fresh)
  homePosts: Post[];
  // Posts listed under News in the menus (empty when not fresh)
  menuPosts: Post[];
}

const dayMs = 1000 * 60 * 60 * 24;

export const getNewsDisplayState = async (
  now: Date = new Date(),
): Promise<NewsDisplayState> => {
  const {
    freshnessDays = 90,
    maxAgeDays = 365,
    minCount = 4,
    sidebarCount = 3,
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
    menuPosts: recentPosts.slice(0, sidebarCount),
  };
};

export interface MenuLink {
  text?: string;
  href?: string;
  links?: MenuLink[];
}

/**
 * Puts the "News" menu item where it belongs: first, listing the latest posts, while news is
 * fresh; otherwise as a plain link under "Home".
 */
export const arrangeNewsMenu = <T extends MenuLink>(
  links: T[],
  news: NewsDisplayState,
): MenuLink[] => {
  const newsItem = links.find((item) => item.text === "News");
  if (!APP_BLOG.isEnabled || !newsItem) return links;
  const others = links.filter((item) => item !== newsItem);

  if (news.isFresh) {
    const postLinks = news.menuPosts.map((post) => ({
      text: post.title,
      href: getPermalink(post.permalink, "post"),
    }));
    return [{ ...newsItem, links: postLinks }, ...others];
  }

  return others.map((item) => {
    if (item.text !== "Home") return item;
    const children = item.links ?? [];
    if (children.some((child) => child.text === "News")) return item;
    return {
      ...item,
      links: [...children, { text: "News", href: getBlogPermalink() }],
    };
  });
};
