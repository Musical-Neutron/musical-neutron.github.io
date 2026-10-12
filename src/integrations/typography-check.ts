import type { AstroIntegration, AstroIntegrationLogger } from "astro";

/*
  Build-time reminder about the removed @tailwindcss/typography plugin.

  The plugin was replaced by a static copy of its CSS (src/assets/styles/prose.css) because
  every release up to 0.5.20 depends on a version of postcss-selector-parser with known
  vulnerabilities. While the site builds, this asks the npm registry which version of
  postcss-selector-parser the latest plugin release depends on, and whether npm's advisory
  database still lists that version as vulnerable. When it no longer does, the build ends
  with a warning (also shown as an annotation on GitHub Actions runs) saying the plugin can
  be restored.

  The check never fails the build. If the registry can't be reached, it is skipped.
*/

const PLUGIN = "@tailwindcss/typography";
const DEPENDENCY = "postcss-selector-parser";
const REGISTRY = "https://registry.npmjs.org";
const TIMEOUT_MS = 10_000;

const RESTORE_STEPS = [
  `run "npm install -D ${PLUGIN}"`,
  `replace '@import "./prose.css";' with '@plugin "${PLUGIN}";' in src/assets/styles/tailwind.css`,
  "delete src/assets/styles/prose.css and src/integrations/typography-check.ts",
  "remove typographyCheck() from astro.config.ts",
];

type Result =
  | { status: "fixed"; message: string }
  | { status: "vulnerable"; message: string }
  | { status: "unclear"; message: string }
  | { status: "skipped"; message: string };

async function getJson(
  url: string,
  init?: RequestInit,
): Promise<Record<string, unknown>> {
  const response = await fetch(url, {
    ...init,
    signal: AbortSignal.timeout(TIMEOUT_MS),
  });
  if (!response.ok)
    throw new Error(`${response.status} ${response.statusText} from ${url}`);
  return (await response.json()) as Record<string, unknown>;
}

async function checkRegistry(): Promise<Result> {
  const latest = await getJson(
    `${REGISTRY}/${PLUGIN.replace("/", "%2f")}/latest`,
  );
  const version = String(latest.version);
  const range = (latest.dependencies as Record<string, string> | undefined)?.[
    DEPENDENCY
  ];

  if (!range) {
    return {
      status: "fixed",
      message: `${PLUGIN} ${version} no longer depends on ${DEPENDENCY}, so the plugin can be restored.`,
    };
  }

  // For a range such as ^7.1.6 this checks the lowest version it allows.
  const lowest = range.match(/\d+\.\d+\.\d+/)?.[0];
  if (!lowest) {
    return {
      status: "unclear",
      message: `${PLUGIN} ${version} depends on ${DEPENDENCY} "${range}", which this check can't read. Check it by hand.`,
    };
  }

  const advisories = await getJson(
    `${REGISTRY}/-/npm/v1/security/advisories/bulk`,
    {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ [DEPENDENCY]: [lowest] }),
    },
  );
  const found = (advisories[DEPENDENCY] as { url: string }[] | undefined) ?? [];

  if (found.length === 0) {
    return {
      status: "fixed",
      message: `${PLUGIN} ${version} depends on ${DEPENDENCY} ${range}, which has no known vulnerabilities, so the plugin can be restored.`,
    };
  }
  return {
    status: "vulnerable",
    message:
      `${PLUGIN} ${version} (latest) still depends on ${DEPENDENCY} ${range}, which has known vulnerabilities ` +
      `(${[...new Set(found.map((advisory) => advisory.url))].join(", ")}). Keep using prose.css for now.`,
  };
}

// GitHub Actions turns lines in this format into warnings on the workflow run's summary page.
function githubAnnotation(title: string, message: string) {
  const escape = (text: string) =>
    text.replace(/%/g, "%25").replace(/\r/g, "%0D").replace(/\n/g, "%0A");
  console.log(
    `::warning title=${escape(title).replace(/:/g, "%3A").replace(/,/g, "%2C")}::${escape(message)}`,
  );
}

function report(result: Result, logger: AstroIntegrationLogger) {
  if (result.status === "fixed") {
    const steps = RESTORE_STEPS.map((step, i) => `  ${i + 1}. ${step}`).join(
      "\n",
    );
    logger.warn(`${result.message}\nTo restore it:\n${steps}`);
    if (process.env.GITHUB_ACTIONS === "true") {
      githubAnnotation(
        "Typography plugin can be restored",
        `${result.message}\n${RESTORE_STEPS.join("; ")}.`,
      );
    }
  } else if (result.status === "unclear") {
    logger.warn(result.message);
  } else {
    logger.info(result.message);
  }
}

export default function typographyCheck(): AstroIntegration {
  let pending: Promise<Result> | undefined;

  return {
    name: "typography-check",
    hooks: {
      // Start the lookup when the build starts so it runs alongside the build, then report at the end.
      "astro:build:start": () => {
        pending = checkRegistry().catch((error: unknown) => ({
          status: "skipped",
          message: `Couldn't check whether ${PLUGIN} can be restored (${error instanceof Error ? error.message : String(error)}).`,
        }));
      },
      "astro:build:done": async ({ logger }) => {
        if (pending) report(await pending, logger);
      },
    },
  };
}
