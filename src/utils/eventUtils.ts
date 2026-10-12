import { calendarDay, DEFAULT_TIMEZONE, parseDate } from "./dateUtils";

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

      // Categorize
      const enhancedItem = {
        ...item,
        start_date: startDate,
        start_time_flag: hasStartTime,
        end_date: validEndDate,
        end_time_flag: hasEndTime,
      };

      if (startDateOnly > currentDateOnly) {
        // Upcoming events checks
        const shouldShow = currentDateOnly >= appearDateOnly;
        const withinMaxWindow =
          typeof maximumDaysBefore === "undefined" ||
          startDateOnly <=
            new Date(currentDateOnly.getTime() + maximumDaysBefore * 86400000);
        if (shouldShow && withinMaxWindow) {
          acc.upcomingEvents.push(enhancedItem);
        }
      } else if (
        startDateOnly <= currentDateOnly &&
        endDateOnly >= currentDateOnly
      ) {
        acc.ongoingEvents.push(enhancedItem);
      } else {
        acc.pastEvents.push(enhancedItem);
      }

      return acc;
    },
    { ongoingEvents: [], upcomingEvents: [], pastEvents: [] },
  );
};
