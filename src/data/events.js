// The events themselves live in events.json, which the editor at /admin/ can change.
// This file fills in the defaults the pages rely on.
import { DEFAULT_TIMEZONE, toZonedISOString } from "~/utils/dateUtils";
import data from "./events.json";

const categoryDefaults = {
  conference: { icon: "tabler:users-group" },
  outreach: { icon: "tabler:microphone" },
  milestone: { icon: "tabler:calendar-event" },
  seminar: { icon: "tabler:presentation" },
};

export const events = data.events.map((entry) => {
  // Treat fields left empty in the editor as missing.
  const e = /** @type {typeof entry} */ (
    Object.fromEntries(
      Object.entries(entry).filter(
        ([, value]) => value !== "" && value !== null,
      ),
    )
  );
  const category = e.category ?? "conference";
  const defaults = categoryDefaults[category] ?? {};
  // Dates and times are written as local wall-clock time in the event's time zone
  // (UK time unless the event says otherwise). With month_only, only the month and
  // year of the date are shown.
  const timezone = e.timezone || DEFAULT_TIMEZONE;
  const hasEnd = Boolean(e.end_date || e.end_time);
  return {
    ...e,
    category,
    timezone,
    start_date: toZonedISOString(e.start_date, e.start_time, timezone),
    end_date: hasEnd
      ? toZonedISOString(e.end_date || e.start_date, e.end_time, timezone)
      : undefined,
    icon: e.icon ?? defaults.icon ?? "tabler:calendar",
  };
});
