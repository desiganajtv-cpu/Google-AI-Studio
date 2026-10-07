/**
 * Date and time utilities for Office Tasks
 */

export function getTodayString(): string {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function getTomorrowString(): string {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function getRelativeDateString(offsetDays: number): string {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function getNextMondayString(): string {
  const d = new Date();
  const dayOfWeek = d.getDay(); // 0 is Sunday, 1 is Monday
  const daysUntilNextMonday = dayOfWeek === 0 ? 1 : (8 - dayOfWeek);
  d.setDate(d.getDate() + daysUntilNextMonday);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function getCurrentTimeString(): string {
  const d = new Date();
  const hours = String(d.getHours()).padStart(2, "0");
  const minutes = String(d.getMinutes()).padStart(2, "0");
  return `${hours}:${minutes}`;
}

export function formatTimeDisplay(timeStr?: string): string {
  if (!timeStr) return "";
  const parts = timeStr.split(":");
  if (parts.length < 2) return timeStr;
  const h = parseInt(parts[0], 10);
  const m = parseInt(parts[1], 10);
  if (isNaN(h) || isNaN(m)) return timeStr;

  const ampm = h >= 12 ? "PM" : "AM";
  const displayH = h % 12 === 0 ? 12 : h % 12;
  const displayM = String(m).padStart(2, "0");
  return `${displayH}:${displayM} ${ampm}`;
}

export function isOverdue(scheduledDate?: string, scheduledTime?: string, status?: string): boolean {
  if (status === "completed") return false;
  if (!scheduledDate) return false;

  const today = getTodayString();
  if (scheduledDate < today) {
    return true;
  }
  if (scheduledDate === today) {
    if (!scheduledTime) return false;
    const currentTime = getCurrentTimeString();
    return scheduledTime < currentTime;
  }
  return false;
}

export function isToday(scheduledDate?: string): boolean {
  if (!scheduledDate) return false;
  return scheduledDate === getTodayString();
}

export function isTomorrow(scheduledDate?: string): boolean {
  if (!scheduledDate) return false;
  return scheduledDate === getTomorrowString();
}

/**
 * Returns human-friendly smart time label:
 * e.g. "Today · 5:00 PM", "Tomorrow · 2:00 PM", "Wednesday · 11:30 AM", "Overdue · Yesterday", "No schedule"
 */
export function getSmartTimeLabel(scheduledDate?: string, scheduledTime?: string, status?: string): {
  label: string;
  isOverdue: boolean;
  relativeCategory: "overdue" | "today" | "tomorrow" | "upcoming" | "none";
} {
  if (!scheduledDate) {
    return { label: "No schedule", isOverdue: false, relativeCategory: "none" };
  }

  const overdue = isOverdue(scheduledDate, scheduledTime, status);
  const timeFormatted = scheduledTime ? ` · ${formatTimeDisplay(scheduledTime)}` : "";

  const today = getTodayString();
  const tomorrow = getTomorrowString();

  const [y, m, d] = scheduledDate.split("-").map(Number);
  const targetDate = new Date(y, m - 1, d);
  const nowDate = new Date();
  nowDate.setHours(0, 0, 0, 0);

  const diffDays = Math.round((targetDate.getTime() - nowDate.getTime()) / (1000 * 60 * 60 * 24));

  if (scheduledDate === today) {
    if (overdue) {
      return {
        label: `Overdue · Earlier today${timeFormatted}`,
        isOverdue: true,
        relativeCategory: "overdue",
      };
    }
    return {
      label: `Today${timeFormatted}`,
      isOverdue: false,
      relativeCategory: "today",
    };
  }

  if (scheduledDate === tomorrow) {
    return {
      label: `Tomorrow${timeFormatted}`,
      isOverdue: false,
      relativeCategory: "tomorrow",
    };
  }

  if (diffDays === -1) {
    return {
      label: `Overdue · Yesterday${timeFormatted}`,
      isOverdue: true,
      relativeCategory: "overdue",
    };
  }

  if (diffDays < -1) {
    return {
      label: `Overdue · ${Math.abs(diffDays)} days ago${timeFormatted}`,
      isOverdue: true,
      relativeCategory: "overdue",
    };
  }

  // Within next 7 days
  if (diffDays > 1 && diffDays < 7) {
    const weekday = targetDate.toLocaleDateString("en-US", { weekday: "long" });
    return {
      label: `${weekday}${timeFormatted}`,
      isOverdue: false,
      relativeCategory: "upcoming",
    };
  }

  // Further out
  const formattedFull = targetDate.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
  return {
    label: `${formattedFull}${timeFormatted}`,
    isOverdue: overdue,
    relativeCategory: overdue ? "overdue" : "upcoming",
  };
}

export function formatHeaderDate(): string {
  const d = new Date();
  return d.toLocaleDateString("en-US", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export function formatCompletedAt(isoString?: string): string {
  if (!isoString) return "";
  try {
    const d = new Date(isoString);
    const today = new Date();
    const isSameDay =
      d.getDate() === today.getDate() &&
      d.getMonth() === today.getMonth() &&
      d.getFullYear() === today.getFullYear();

    const timeStr = d.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });

    if (isSameDay) {
      return `Completed today at ${timeStr}`;
    }
    return `Completed ${d.toLocaleDateString("en-US", { month: "short", day: "numeric" })} at ${timeStr}`;
  } catch {
    return "";
  }
}
