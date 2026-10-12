// Time zone the site's own events default to, and the one "today" is judged in.
export const DEFAULT_TIMEZONE = "Europe/London";

// Helper function to parse and validate dates
export const parseDate = (
  date: string | Date | undefined,
): { parsedDate: Date; hasTime: boolean } => {
  if (!date) {
    // Return default date and false if date is undefined
    const defaultDate = new Date(NaN);
    return { parsedDate: defaultDate, hasTime: false };
  }
  const parsedDate = new Date(date);
  const isValid = !isNaN(parsedDate.getTime());

  // Check if date includes a time component
  const hasTime =
    typeof date === "string" && (date.includes("T") || date.includes(" "));

  return {
    parsedDate: isValid ? parsedDate : new Date(NaN), // Return default date if date is invalid
    hasTime: isValid ? hasTime : false, // Return false if date is invalid
  };
};

// Wall-clock parts of an instant in a given time zone.
const zonedParts = (date: Date, timeZone: string) => {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone,
    hourCycle: "h23",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).formatToParts(date);
  const get = (type: string) =>
    Number(parts.find((p) => p.type === type)?.value);
  return {
    year: get("year"),
    month: get("month"),
    day: get("day"),
    hour: get("hour"),
    minute: get("minute"),
  };
};

// Minutes the time zone is ahead of UTC at the given instant.
const zoneOffsetMinutes = (date: Date, timeZone: string) => {
  const p = zonedParts(date, timeZone);
  const asUTC = Date.UTC(p.year, p.month - 1, p.day, p.hour, p.minute);
  return Math.round(
    (asUTC - Math.floor(date.getTime() / 60000) * 60000) / 60000,
  );
};

/**
 * Turns an event's local date and time ("2026-10-13" and "15:00") in the event's time zone
 * into an ISO string with the right UTC offset ("2026-10-13T15:00:00+01:00").
 * Without a time, the date is returned unchanged and is treated as an all-day date.
 */
export const toZonedISOString = (
  date: string,
  time: string | undefined,
  timeZone: string,
): string => {
  if (!time) return date;
  const [year, month, day] = date.split("-").map(Number);
  const [hour, minute] = time.split(":").map(Number);
  const wallClock = Date.UTC(year, month - 1, day, hour, minute);
  let offset = zoneOffsetMinutes(new Date(wallClock), timeZone);
  // Recheck once in case the first guess fell on the other side of a clock change.
  offset = zoneOffsetMinutes(new Date(wallClock - offset * 60000), timeZone);
  const sign = offset < 0 ? "-" : "+";
  const abs = Math.abs(offset);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date}T${pad(hour)}:${pad(minute)}:00${sign}${pad(Math.floor(abs / 60))}:${pad(abs % 60)}`;
};

/**
 * The calendar day of an instant, as a UTC-midnight Date, so days can be compared.
 * Dates without a time are stored as UTC midnight, so they're read in UTC.
 */
export const calendarDay = (
  date: Date,
  hasTime: boolean,
  timeZone: string = DEFAULT_TIMEZONE,
): Date => {
  const p = zonedParts(date, hasTime ? timeZone : "UTC");
  return new Date(Date.UTC(p.year, p.month - 1, p.day));
};

// Helper function to format the date
export const formatDateRange = (
  startDateString: string | Date,
  endDateString?: string | Date,
  startTimeFlag?: boolean,
  endTimeFlag?: boolean,
  timeZone: string = DEFAULT_TIMEZONE,
  format = "en-GB",
  monthOnly = false,
) => {
  const startDate = new Date(startDateString);
  const endDate = endDateString ? new Date(endDateString) : startDate;

  // Check if the start date is valid
  if (isNaN(startDate.getTime())) return "Invalid date";

  // Events where only the month is known (e.g. older ones taken from a CV): "October 2018",
  // or "October – November 2018" style ranges.
  if (monthOnly) {
    const formatMonth = (date: Date) =>
      date.toLocaleDateString(format, {
        timeZone: "UTC",
        year: "numeric",
        month: "long",
      });
    const startMonth = formatMonth(startDate);
    const endMonth = formatMonth(endDate);
    return startMonth === endMonth ? startMonth : `${startMonth} — ${endMonth}`;
  }

  // Times are shown in the event's own time zone, labelled (e.g. "15:00 BST").
  // Dates without a time are stored as UTC midnight, so they're shown in UTC.
  const zoneFor = (includeTime: boolean) => (includeTime ? timeZone : "UTC");
  const formatDate = (date: Date, includeTime: boolean) =>
    date.toLocaleDateString(format, {
      timeZone: zoneFor(includeTime),
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  const formatTime = (date: Date, withZone: boolean) =>
    date.toLocaleTimeString(format, {
      timeZone,
      hour: "2-digit",
      minute: "2-digit",
      ...(withZone ? { timeZoneName: "short" } : {}),
    });

  // Helper function to format a date and time
  const formatDateTime = (date: Date, includeTime: boolean) => {
    const dateStr = formatDate(date, includeTime);
    if (!includeTime) return dateStr;
    return `${dateStr} at ${formatTime(date, true)}`;
  };

  // If endDate is before or equal to startDate, return only the start date
  if (endDate.getTime() <= startDate.getTime()) {
    return formatDateTime(startDate, !!startTimeFlag);
  }

  // Format start and end dates/times
  const startFormatted = formatDateTime(startDate, !!startTimeFlag);
  const endFormatted = formatDateTime(endDate, !!endTimeFlag);

  // If the start and end dates are the same day, return a simplified range
  if (
    formatDate(startDate, !!startTimeFlag) ===
    formatDate(endDate, !!endTimeFlag)
  ) {
    // If both time flags are true, include both start and end times
    if (startTimeFlag && endTimeFlag) {
      return `${formatDate(startDate, true)}, ${formatTime(startDate, false)} – ${formatTime(endDate, true)}`;
    } else {
      return startFormatted;
    }
  }

  // Return the full date range
  return `${startFormatted} — ${endFormatted}`;
};
