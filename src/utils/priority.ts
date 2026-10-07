import { Priority, TaskStatus } from "../types/task";

export const PRIORITY_CONFIG: Record<
  Priority,
  {
    label: string;
    badgeText: string;
    dotColor: string;
    textColor: string;
    bgColor: string;
    borderColor: string;
    hoverBg: string;
    rank: number;
  }
> = {
  urgent: {
    label: "Urgent",
    badgeText: "Urgent",
    dotColor: "bg-rose-500",
    textColor: "text-rose-600 dark:text-rose-400",
    bgColor: "bg-rose-50 dark:bg-rose-950/40",
    borderColor: "border-rose-200 dark:border-rose-800/60",
    hoverBg: "hover:bg-rose-100 dark:hover:bg-rose-900/50",
    rank: 1,
  },
  high: {
    label: "High",
    badgeText: "High",
    dotColor: "bg-amber-500",
    textColor: "text-amber-600 dark:text-amber-400",
    bgColor: "bg-amber-50 dark:bg-amber-950/40",
    borderColor: "border-amber-200 dark:border-amber-800/60",
    hoverBg: "hover:bg-amber-100 dark:hover:bg-amber-900/50",
    rank: 2,
  },
  medium: {
    label: "Medium",
    badgeText: "Medium",
    dotColor: "bg-sky-500",
    textColor: "text-sky-600 dark:text-sky-400",
    bgColor: "bg-sky-50 dark:bg-sky-950/40",
    borderColor: "border-sky-200 dark:border-sky-800/60",
    hoverBg: "hover:bg-sky-100 dark:hover:bg-sky-900/50",
    rank: 3,
  },
  low: {
    label: "Low",
    badgeText: "Low",
    dotColor: "bg-emerald-500",
    textColor: "text-emerald-600 dark:text-emerald-400",
    bgColor: "bg-emerald-50 dark:bg-emerald-950/40",
    borderColor: "border-emerald-200 dark:border-emerald-800/60",
    hoverBg: "hover:bg-emerald-100 dark:hover:bg-emerald-900/50",
    rank: 4,
  },
};

export const STATUS_CONFIG: Record<
  TaskStatus,
  {
    label: string;
    textColor: string;
    bgColor: string;
    borderColor: string;
    dotColor: string;
  }
> = {
  pending: {
    label: "Pending",
    textColor: "text-neutral-600 dark:text-neutral-400",
    bgColor: "bg-neutral-100 dark:bg-neutral-800",
    borderColor: "border-neutral-200 dark:border-neutral-700",
    dotColor: "bg-neutral-400",
  },
  in_progress: {
    label: "In Progress",
    textColor: "text-blue-600 dark:text-blue-400",
    bgColor: "bg-blue-50 dark:bg-blue-950/40",
    borderColor: "border-blue-200 dark:border-blue-800/60",
    dotColor: "bg-blue-500",
  },
  waiting: {
    label: "Waiting",
    textColor: "text-purple-600 dark:text-purple-400",
    bgColor: "bg-purple-50 dark:bg-purple-950/40",
    borderColor: "border-purple-200 dark:border-purple-800/60",
    dotColor: "bg-purple-500",
  },
  completed: {
    label: "Completed",
    textColor: "text-emerald-600 dark:text-emerald-400",
    bgColor: "bg-emerald-50 dark:bg-emerald-950/40",
    borderColor: "border-emerald-200 dark:border-emerald-800/60",
    dotColor: "bg-emerald-500",
  },
};

export const DEFAULT_CATEGORIES = [
  "Development",
  "Website",
  "Client",
  "Office",
  "Discussion",
  "Purchase",
  "Setup",
  "Testing",
  "Server",
  "Design",
  "Personal",
  "Other",
];
