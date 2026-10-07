import { Task, AppSettings } from "../types/task";
import { generateSampleTasks } from "../data/sampleTasks";
import { DEFAULT_CATEGORIES } from "./priority";
import { getTodayString } from "./dateUtils";

const STORAGE_KEYS = {
  TASKS: "office_tasks_data_v1",
  SETTINGS: "office_tasks_settings_v1",
};

export const DEFAULT_SETTINGS: AppSettings = {
  theme: "system",
  notificationsEnabled: true,
  defaultReminderOffset: "15m",
  soundEnabled: true,
  categories: DEFAULT_CATEGORIES,
};

export function loadTasksFromStorage(): Task[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.TASKS);
    if (!raw) {
      const initial = generateSampleTasks();
      saveTasksToStorage(initial);
      return initial;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return [...parsed]
        .sort((a: Task, b: Task) => (a.order ?? 999) - (b.order ?? 999))
        .map((t: Task, idx: number) => ({
          ...t,
          order: idx + 1,
        }));
    }
    return [];
  } catch (err) {
    console.error("Failed to load tasks from localStorage:", err);
    return generateSampleTasks();
  }
}

export function saveTasksToStorage(tasks: Task[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(tasks));
  } catch (err) {
    console.error("Failed to save tasks to localStorage:", err);
  }
}

export function loadSettingsFromStorage(): AppSettings {
  if (typeof window === "undefined") return DEFAULT_SETTINGS;
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    if (!raw) return DEFAULT_SETTINGS;
    const parsed = JSON.parse(raw);
    return {
      ...DEFAULT_SETTINGS,
      ...parsed,
      categories: Array.isArray(parsed.categories) && parsed.categories.length > 0
        ? parsed.categories
        : DEFAULT_CATEGORIES,
    };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function saveSettingsToStorage(settings: AppSettings): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  } catch (err) {
    console.error("Failed to save settings to localStorage:", err);
  }
}

/**
 * Exports all tasks as a formatted .json file
 */
export function exportTasksAsJSON(tasks: Task[]): void {
  const dateStr = getTodayString();
  const filename = `office-tasks-${dateStr}.json`;
  const exportPayload = {
    appName: "Office Tasks",
    version: "1.0",
    exportedAt: new Date().toISOString(),
    totalCount: tasks.length,
    tasks,
  };

  const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(exportPayload, null, 2));
  const downloadAnchor = document.createElement("a");
  downloadAnchor.setAttribute("href", dataStr);
  downloadAnchor.setAttribute("download", filename);
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
}

/**
 * Validates and imports tasks from a JSON string or parsed object
 */
export interface ImportResult {
  success: boolean;
  validTasks: Task[];
  restoredCount: number;
  skippedCount: number;
  message: string;
}

export function validateAndImportTasks(jsonData: unknown): ImportResult {
  try {
    let rawList: unknown[] = [];

    if (Array.isArray(jsonData)) {
      rawList = jsonData;
    } else if (typeof jsonData === "object" && jsonData !== null) {
      const obj = jsonData as Record<string, unknown>;
      if (Array.isArray(obj.tasks)) {
        rawList = obj.tasks;
      } else {
        return {
          success: false,
          validTasks: [],
          restoredCount: 0,
          skippedCount: 0,
          message: "Invalid file format. No task list found in JSON.",
        };
      }
    } else {
      return {
        success: false,
        validTasks: [],
        restoredCount: 0,
        skippedCount: 0,
        message: "Parsed content is neither an array nor an object.",
      };
    }

    const validTasks: Task[] = [];
    let skippedCount = 0;

    const validPriorities = new Set(["urgent", "high", "medium", "low"]);
    const validStatuses = new Set(["pending", "in_progress", "waiting", "completed"]);

    rawList.forEach((item, index) => {
      if (!item || typeof item !== "object") {
        skippedCount++;
        return;
      }

      const raw = item as Record<string, unknown>;
      // Must have title string
      if (typeof raw.title !== "string" || !raw.title.trim()) {
        skippedCount++;
        return;
      }

      const id = typeof raw.id === "string" && raw.id.trim() ? raw.id : `imported-${Date.now()}-${index}`;
      const title = raw.title.trim();
      const description = typeof raw.description === "string" ? raw.description : undefined;
      const category = typeof raw.category === "string" && raw.category.trim() ? raw.category : "General";
      const priority = typeof raw.priority === "string" && validPriorities.has(raw.priority.toLowerCase())
        ? (raw.priority.toLowerCase() as Task["priority"])
        : "medium";
      const status = typeof raw.status === "string" && validStatuses.has(raw.status.toLowerCase())
        ? (raw.status.toLowerCase() as Task["status"])
        : "pending";

      const scheduledDate = typeof raw.scheduledDate === "string" && /^\d{4}-\d{2}-\d{2}$/.test(raw.scheduledDate)
        ? raw.scheduledDate
        : undefined;

      const scheduledTime = typeof raw.scheduledTime === "string" && raw.scheduledTime.trim()
        ? raw.scheduledTime
        : undefined;

      const reminderEnabled = Boolean(raw.reminderEnabled);
      const reminderTime = typeof raw.reminderTime === "string" ? (raw.reminderTime as Task["reminderTime"]) : "15m";

      const createdAt = typeof raw.createdAt === "string" ? raw.createdAt : new Date().toISOString();
      const updatedAt = typeof raw.updatedAt === "string" ? raw.updatedAt : new Date().toISOString();
      const completedAt = typeof raw.completedAt === "string" ? raw.completedAt : undefined;
      const tags = Array.isArray(raw.tags) ? raw.tags.filter((t) => typeof t === "string") : [];
      const order = typeof raw.order === "number" ? raw.order : index + 1;

      validTasks.push({
        id,
        title,
        description,
        category,
        priority,
        status,
        scheduledDate,
        scheduledTime,
        reminderEnabled,
        reminderTime,
        createdAt,
        updatedAt,
        completedAt,
        tags,
        order,
      });
    });

    return {
      success: validTasks.length > 0,
      validTasks,
      restoredCount: validTasks.length,
      skippedCount,
      message:
        validTasks.length > 0
          ? `Import successful: ${validTasks.length} task${validTasks.length === 1 ? "" : "s"} restored.${
              skippedCount > 0 ? ` ${skippedCount} invalid record${skippedCount === 1 ? "" : "s"} skipped.` : ""
            }`
          : "No valid task records found to import.",
    };
  } catch (err) {
    return {
      success: false,
      validTasks: [],
      restoredCount: 0,
      skippedCount: 0,
      message: `Failed to parse JSON file: ${err instanceof Error ? err.message : "Unknown error"}`,
    };
  }
}
