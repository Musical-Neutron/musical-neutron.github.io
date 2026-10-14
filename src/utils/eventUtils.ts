import {
  calendarDay,
  DEFAULT_TIMEZONE,
  parseDate,
  toZonedISOString,
} from "./dateUtils";

export interface CategorizedEvents<T> {
  ongoingEvents: T[];
  upcomingEvents: T[];
  pastEvents: T[];
}

export const categorizeEvents = <
  T extends {
    start_date?: string | Date;
    end_date?: string | Date;
    appear_days_before?: number;
    timezone?: string;
  },
>(
  items: T[],
  options: {
    currentDate?: Date;
    defaultAppearanceDelay?: number;
    maximumDaysBefore?: number;
  } = {},
): CategorizedEvents<
  T & {
    start_date: Date;
    start_time_flag: boolean;
    end_date: Date;
    end_time_flag: boolean;
    start_ms: number;
    end_ms: number;
  }
> => {
  const {
    currentDate = new Date(),
    defaultAppearanceDelay = 365 * 10,
    maximumDaysBefore: maximumDaysBefore,
  } = options;

  return items.reduce(
    (
      acc: CategorizedEvents<
        T & {
          start_date: Date;
          start_time_flag: boolean;
          end_date: Date;
          end_time_flag: boolean;
          start_ms: number;
          end_ms: number;
        }
      >,
      item,
    ) => {
      const { parsedDate: startDate, hasTime: hasStartTime } = parseDate(
        item.start_date,
      );
      if (isNaN(startDate.getTime())) return acc;

      const { parsedDate: endDate, hasTime: hasEndTime } = parseDate(
        item.end_date || item.start_date,
      );
      const validEndDate = isNaN(endDate.getTime()) ? startDate : endDate;

      // Create date-only versions: the event's days in its own time zone, and today in the site's,
      // so the result doesn't depend on the time zone of the machine running the build
      const timeZone = item.timezone ?? DEFAULT_TIMEZONE;
      const startDateOnly = calendarDay(startDate, hasStartTime, timeZone);
      const endDateOnly = calendarDay(validEndDate, hasEndTime, timeZone);
      const currentDateOnly = calendarDay(currentDate, true, DEFAULT_TIMEZONE);

      // Calculate days before appearance
      let daysBefore = item.appear_days_before ?? defaultAppearanceDelay;
      if (typeof maximumDaysBefore !== "undefined") {
        daysBefore = item.appear_days_before
          ? Math.min(item.appear_days_before, maximumDaysBefore)
          : maximumDaysBefore;
      }

      // Calculate appear date
      const appearDateOnly = new Date(startDateOnly);
      appearDateOnly.setUTCDate(appearDateOnly.getUTCDate() - daysBefore);

      // The exact moments the event starts and is over. Times given in the data are used as they
      // are. Without a start time the event starts at midnight on its first day, and without an end
      // time it lasts until midnight at the end of its last day, both in the event's time zone.
      const dayStartMs = (day: Date) =>
        new Date(
          toZonedISOString(day.toISOString().slice(0, 10), "00:00", timeZone),
        ).getTime();
      const startMs = hasStartTime
        ? startDate.getTime()
        : dayStartMs(startDateOnly);
      const hasTimedEnd = Boolean(item.end_date) && hasEndTime;
      const endMs = hasTimedEnd
        ? validEndDate.getTime()
        : dayStartMs(new Date(endDateOnly.getTime() + 86400000));
      const nowMs = currentDate.getTime();

      // Categorize
      const enhancedItem = {
        ...item,
        start_date: startDate,
        start_time_flag: hasStartTime,
        end_date: validEndDate,
        end_time_flag: hasEndTime,
        start_ms: startMs,
        end_ms: endMs,
      };

      if (nowMs >= endMs) {
        acc.pastEvents.push(enhancedItem);
      } else if (nowMs >= startMs) {
        acc.ongoingEvents.push(enhancedItem);
      } else {
        // Upcoming events checks
        const shouldShow = currentDateOnly >= appearDateOnly;
        const withinMaxWindow =
          typeof maximumDaysBefore === "undefined" ||
          startDateOnly <=
            new Date(currentDateOnly.getTime() + maximumDaysBefore * 86400000);
        if (shouldShow && withinMaxWindow) {
          acc.upcomingEvents.push(enhancedItem);
        }
      }

      return acc;
    },
    { ongoingEvents: [], upcomingEvents: [], pastEvents: [] },
  );
};
