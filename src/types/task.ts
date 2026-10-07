export type Priority = "urgent" | "high" | "medium" | "low";
export type TaskStatus = "pending" | "in_progress" | "waiting" | "completed";

export type ReminderOffset = "at_time" | "5m" | "10m" | "15m" | "30m" | "1h";

export interface Task {
  id: string;
  title: string;
  description?: string;
  notes?: string;
  category: string;
  priority: Priority;
  status: TaskStatus;
  scheduledDate?: string; // YYYY-MM-DD
  scheduledTime?: string; // 24h format HH:mm e.g. "17:00", "09:30"
  reminderEnabled: boolean;
  reminderTime?: ReminderOffset;
  createdAt: string; // ISO
  updatedAt: string; // ISO
  completedAt?: string; // ISO
  tags?: string[];
  order?: number; // manual ordering index
}

export type ViewMode = "list" | "today" | "timeline" | "week";

export type FilterType =
  | "all"
  | "today"
  | "urgent"
  | "pending"
  | "in_progress"
  | "waiting"
  | "completed"
  | "overdue";

export type SortOption =
  | "smart"
  | "time_asc"
  | "time_desc"
  | "priority"
  | "created_desc"
  | "updated_desc"
  | "alpha_asc"
  | "manual";

export interface AppSettings {
  theme: "light" | "dark" | "system";
  notificationsEnabled: boolean;
  defaultReminderOffset: ReminderOffset;
  soundEnabled: boolean;
  categories: string[];
}

export interface NaturalLanguageParseResult {
  title: string;
  scheduledDate?: string;
  scheduledTime?: string;
  priority?: Priority;
  category?: string;
  rawMatched: {
    dateText?: string;
    timeText?: string;
    priorityText?: string;
    categoryText?: string;
  };
}
