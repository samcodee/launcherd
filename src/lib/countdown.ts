export const MS_PER_DAY = 24 * 60 * 60 * 1000;

export const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

export interface DateDraft {
  year: number;
  month: number;
  day: number;
}

export function daysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

export function countdownDaysLabel(target: number): string {
  const today = new Date();
  const startOfToday = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate(),
  ).getTime();
  const diff = Math.round((target - startOfToday) / MS_PER_DAY);
  if (diff > 0) return diff === 1 ? "1 day to go" : `${diff} days to go`;
  if (diff === 0) return "Today";
  return diff === -1 ? "1 day ago" : `${-diff} days ago`;
}

export function countdownDate(target: number): string {
  return new Date(target).toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function draftFromTimestamp(timestamp: number): DateDraft {
  const date = new Date(timestamp);
  return {
    year: date.getFullYear(),
    month: date.getMonth(),
    day: date.getDate(),
  };
}

export function draftFromToday(): DateDraft {
  return draftFromTimestamp(Date.now());
}

export function draftToTimestamp(draft: DateDraft): number {
  return new Date(draft.year, draft.month, draft.day).getTime();
}

export function shiftDraftDay(draft: DateDraft, delta: number): DateDraft {
  const max = daysInMonth(draft.year, draft.month);
  let day = draft.day + delta;
  if (day < 1) day = max;
  if (day > max) day = 1;
  return { ...draft, day };
}

export function shiftDraftMonth(draft: DateDraft, delta: number): DateDraft {
  const month = (draft.month + delta + 12) % 12;
  return {
    ...draft,
    month,
    day: Math.min(draft.day, daysInMonth(draft.year, month)),
  };
}

export function shiftDraftYear(draft: DateDraft, delta: number): DateDraft {
  const year = draft.year + delta;
  return {
    ...draft,
    year,
    day: Math.min(draft.day, daysInMonth(year, draft.month)),
  };
}
