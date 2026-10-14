import { getRssString } from "@astrojs/rss";

import { SITE, METADATA, APP_BLOG } from "astrowind:config";
import { fetchPosts } from "~/utils/blog";
import { getPermalink } from "~/utils/permalinks";
import { outreachEvents } from "~/data/events.js";

export const GET = async () => {
  if (!APP_BLOG.isEnabled) {
    return new Response(null, {
      status: 404,
      statusText: "Not found",
    });
  }

  const now = new Date();

  // News posts
  const posts = await fetchPosts();
  const postItems = posts.map((post) => ({
    link: getPermalink(post.permalink, "post"),
    title: post.title,
    description: post.excerpt,
    pubDate: post.publishDate,
  }));

  // Events the site shows (see outreachEvents in src/data/events.js), as on the CWEBDWARFS
  // site: each joins the feed on its start date and links to its own web page, or else to
  // its place on the Outreach page.
  const categoryLabel = (category?: string) =>
    category ? category.charAt(0).toUpperCase() + category.slice(1) : "";
  const eventItems = outreachEvents.map((event) => ({
    title: categoryLabel(event.category)
      ? `[${categoryLabel(event.category)}] ${event.title}`
      : event.title,
    description: event.description ?? "",
    pubDate: new Date(event.start_date),
    link: event.info_link || `${getPermalink("/outreach")}#${event.eventID}`,
  }));

  // Newest first; nothing dated in the future
  const items = [...postItems, ...eventItems]
    .filter((item) => item.pubDate <= now)
    .sort((a, b) => b.pubDate.getTime() - a.pubDate.getTime());

  const rss = await getRssString({
    title: `${SITE.name}'s news`,
    description: METADATA?.description || "",
    site: import.meta.env.SITE,
    items,
    trailingSlash: SITE.trailingSlash,
  });

  return new Response(rss, {
    headers: {
      "Content-Type": "application/xml",
    },
  });
};
