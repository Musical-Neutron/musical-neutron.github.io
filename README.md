# Oliver Newton — personal website

My personal website: research, CV, news, outreach and press.

**Live site:** <https://oliver-newton.com>

It is a static site built with [Astro](https://astro.build/) and [Tailwind CSS](https://tailwindcss.com/), starting
from the [AstroWind](https://github.com/arthelokyo/astrowind) template, and published with GitHub Pages. The CWEBDWARFS
project has its own site, in the
[cwebdwarfs-sitefiles](https://github.com/Musical-Neutron/cwebdwarfs-sitefiles) repository, linked from the Research
menu.

## What's on the site

| Page           | Address                 | Notes                                                                                      |
| :------------- | :---------------------- | :----------------------------------------------------------------------------------------- |
| Home           | `/`                     | About me, a banner of upcoming outreach events, and the latest news while it's fresh       |
| CV             | `/cv`                   | Selected highlights and the full CV as a PDF; the "Last updated" date is read from the PDF |
| Research       | `/research`             | Research topics and their papers; each topic is also a link in the Research menu           |
| Outreach       | `/outreach`             | Outreach events, grouped into _Happening now_, _Coming up_ and _Past events_               |
| News           | `/news`, `/<post-name>` |                                                                                            |
| Press          | `/press`                | Media coverage and a press kit                                                             |
| Contact        | `/contact`              | Contact details and a form (Formspree, with reCAPTCHA)                                     |
| Privacy notice | `/privacy`              |                                                                                            |
| RSS feed       | `/rss.xml`              | News posts, outreach events and press coverage                                             |

## Editing the content

### In the site editor

Events, research topics and papers, news posts and the announcement bar can be edited in a form-based editor
([Sveltia CMS](https://sveltiacms.app)) that runs on your own computer:

1. Start the local preview with `npm run dev`.
2. Open <http://localhost:4321/admin/index.html> in Chrome or Edge (other browsers can't open local folders).
3. Choose **Work with Local Repository** and select this folder.

Saving writes straight into the files listed below. Nothing is committed or pushed: check the changes with
`git diff`, then commit and push as usual. News posts have a formatting toolbar, and an **Edit in Markdown** switch
for anything it doesn't cover.

The icons offered for events and research topics are shown at <http://localhost:4321/admin/icons>.

### Where everything lives

| Content                            | File                                | In the editor |
| :--------------------------------- | :---------------------------------- | :-----------: |
| Events                             | `src/data/events.json`              |      Yes      |
| Research topics and papers         | `src/data/research.json`            |      Yes      |
| News posts                         | `src/data/post/`                    |      Yes      |
| News tags                          | `src/data/tags/`                    |      Yes      |
| News categories                    | `src/data/categories/`              |      Yes      |
| Pictures in news posts             | `src/assets/images/news/`           |      Yes      |
| Announcement bar                   | `src/data/announcement.json`        |      Yes      |
| CV (replace the file to update it) | `public/cv/CV.pdf`                  |      No       |
| CV highlights                      | `src/pages/cv.astro`                |      No       |
| Media coverage on the Press page   | `src/data/press.js`                 |      No       |
| Press kit downloads                | `public/press-kit/`                 |      No       |
| Menus and footer links             | `src/navigation.ts`                 |      No       |
| Personal details, news timing      | `src/config.yaml`                   |      No       |
| Colours                            | `src/components/CustomStyles.astro` |      No       |
| Page text                          | `src/pages/`                        |      No       |
| Editor settings                    | `public/admin/config.yml`           |      No       |

## How parts of the site behave

**Events.** Only outreach events are shown on the site (see `outreachEvents` in `src/data/events.js`), so events in
other categories can be kept in the file for later. Each event is timed in its own time zone, and an event whose day
isn't known yet can be marked _Only the month is known_. The site works out what's happening now, coming up or past
when it is built, and again in the visitor's browser, so the pages stay right between builds. The home page banner
shows events that are happening now or start within the next 14 days; an event's _Show in upcoming events this many
days ahead_ setting can shorten that. An event's _Write-up_ links it to a news post, shown as **Read the write-up**.

**News.** While a post is less than 90 days old, the home page shows _Latest news_ above About, with a News button,
and News is the first link under Home in the menus. Otherwise the section is hidden and News is the last link under
Home. The timings are under `apps.blog.latest` in `src/config.yaml`, and the rules are in
`src/utils/newsDisplay.ts`. A post marked _Job move_ shows the job-move graphic when it has no picture of its own.
A post's tags and category are picked from drop-downs of those on their lists (one small file each in `src/data/tags/`
and `src/data/categories/`, holding the name), and **Add Tag** or **Add Category** puts a new one on the list. Posts
store the file names and the site looks the names up on the lists, so renaming a tag or category under _News tags_ or
_News categories_ renames it everywhere, and deleting it removes it from every post. Only tags and categories on the
lists appear on the site.

**Links.** Links that leave the site open in a new tab; links within it open in the same one. To keep a particular
link in the same tab, give it `target="_self"` (the rule is at the end of `src/components/common/BasicScripts.astro`).
A link to a place on the page you're already on, such as a research topic in the menu, scrolls there smoothly.

**Announcement bar.** An optional strip across the top of every page on tablets and computers, set in the site editor:
switch it on or off, and give it a badge (such as NEW), its text, a link and a time after which it hides itself.

**Going live later.** Research topics, papers and news posts can be prepared ahead and kept off the site. _Draft_ keeps
something hidden until you untick it; to schedule it instead, leave _Draft_ unticked and give a topic or paper a _Go
live_ time or a post a future date (the announcement bar has a _Show from_ time too). A topic that isn't live is left
out of the menu as well. Things go live at the first rebuild after their time, never before; the site rebuilds every
four hours from Monday to Saturday, so to go live at an exact time, run the deploy from the Actions tab (**Run
workflow**) at that time.

**Menus.** On wide screens the menu is a sidebar on the left; on phones it is a header with a menu button. The
Research menu is built from the topics in `src/data/research.json`.

**Colours.** All the site's colours, for light and dark mode, are set in `src/components/CustomStyles.astro`.

## Working on the site

Requires Node.js 22.12 or later. Run these from this folder:

| Command           | Action                                                        |
| :---------------- | :------------------------------------------------------------ |
| `npm install`     | Install the dependencies (once, and after they change)        |
| `npm run dev`     | Local preview at <http://localhost:4321/>                     |
| `npm run build`   | Build the site into `dist/`                                   |
| `npm run preview` | Preview the built site                                        |
| `npm run check`   | Check for errors: Astro, ESLint and Prettier (as GitHub does) |
| `npm run fix`     | Fix what ESLint and Prettier can fix by themselves            |

## Publishing

GitHub Actions does the publishing:

- `deploy.yml` builds the site and publishes it to GitHub Pages on every push to `master`, every four hours from
  Monday to Saturday (so event and news timings stay current without a push), and on demand from the Actions tab
  (**Run workflow**).
- `actions.yaml` builds and checks every pull request into `master`, and every push to it.
- `dependabot-reviewer.yml` merges Dependabot's patch and minor updates once the checks pass, and labels major
  updates `requires-manual-qa` for you to check first.
- `merge-schedule.yml` merges a pull request on a chosen day: put `/schedule 2026-11-01` (with your date) in the pull
  request's description. It checks every hour and only merges once the checks pass.

## Licence

The AstroWind template this site is built on is MIT-licensed; its licence is in [LICENSE.md](./LICENSE.md).
