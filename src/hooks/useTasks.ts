import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import {
  Task,
  FilterType,
  SortOption,
  ViewMode,
  AppSettings,
  Priority,
  TaskStatus,
} from "../types/task";
import {
  loadTasksFromStorage,
  saveTasksToStorage,
  loadSettingsFromStorage,
  saveSettingsToStorage,
  exportTasksAsJSON,
  validateAndImportTasks,
  ImportResult,
} from "../utils/taskStorage";
import { generateSampleTasks } from "../data/sampleTasks";
import { isOverdue, isToday, getTodayString, getCurrentTimeString, formatTimeDisplay } from "../utils/dateUtils";
import {
  sendTaskNotification,
  sendTaskAlarmNotification,
  sendSystemOnDueNotification,
  sendTestNotification,
  requestNotificationPermission,
  getNotificationPermissionState,
} from "../utils/notifications";
import { playCompleteSound, stopAlarmSound } from "../utils/sound";

export interface ToastMessage {
  id: string;
  type: "success" | "info" | "warning" | "error";
  title: string;
  message?: string;
  taskId?: string;
}

export function useTasks() {
  const [tasks, setTasks] = useState<Task[]>(() => loadTasksFromStorage());
  const [settings, setSettings] = useState<AppSettings>(() => loadSettingsFromStorage());
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [activeFilter, setActiveFilter] = useState<FilterType>("all");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [sortOption, setSortOption] = useState<SortOption>("smart");
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Active ringing alarm state
  const [activeAlarmTask, setActiveAlarmTask] = useState<Task | null>(null);

  // System ON / Startup due alert state
  const [systemOnAlert, setSystemOnAlert] = useState<{
    overdueTasks: Task[];
    todayTasks: Task[];
  } | null>(null);

  // Desktop notification permission state
  const [permissionState, setPermissionState] = useState<NotificationPermission | "unsupported">(
    () => getNotificationPermissionState()
  );

  // Track fired reminders & alarms in this session to prevent duplicate alarms
  const firedRemindersRef = useRef<Set<string>>(new Set());

  // Save tasks on changes
  useEffect(() => {
    saveTasksToStorage(tasks);
  }, [tasks]);

  // Apply theme & listen to system media query
  useEffect(() => {
    saveSettingsToStorage(settings);
    const root = document.documentElement;
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

    const applyTheme = () => {
      const isDark =
        settings.theme === "dark" ||
        (settings.theme === "system" && mediaQuery.matches);
      if (isDark) {
        root.classList.add("dark");
        document.body.classList.add("dark");
      } else {
        root.classList.remove("dark");
        document.body.classList.remove("dark");
      }
    };

    applyTheme();

    if (settings.theme === "system") {
      mediaQuery.addEventListener("change", applyTheme);
      return () => mediaQuery.removeEventListener("change", applyTheme);
    }
  }, [settings]);

  // Toast helper
  const addToast = useCallback(
    (type: ToastMessage["type"], title: string, message?: string, taskId?: string) => {
      const id = `${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
      setToasts((prev) => [...prev, { id, type, title, message, taskId }]);
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, 4500);
    },
    []
  );

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // System ON / Startup Due Date check
  const runSystemOnCheck = useCallback(
    (force = false) => {
      const sessionKey = "office_tasks_system_on_checked_v1";
      const hasRun = typeof window !== "undefined" ? sessionStorage.getItem(sessionKey) : null;
      if (hasRun && !force) return;

      const overdue = tasks.filter(
        (t) => t.status !== "completed" && isOverdue(t.scheduledDate, t.scheduledTime, t.status)
      );
      const todayTasks = tasks.filter(
        (t) =>
          t.status !== "completed" &&
          isToday(t.scheduledDate) &&
          !isOverdue(t.scheduledDate, t.scheduledTime, t.status)
      );

      if (overdue.length > 0 || todayTasks.length > 0) {
        setSystemOnAlert({ overdueTasks: overdue, todayTasks });
        if (settings.notificationsEnabled) {
          sendSystemOnDueNotification(overdue.length, todayTasks.length, settings.soundEnabled);
        }
        addToast(
          "warning",
          "System ON: Due Date Audit",
          `${overdue.length} overdue task(s) and ${todayTasks.length} task(s) scheduled for today.`
        );
      }

      if (typeof window !== "undefined") {
        sessionStorage.setItem(sessionKey, new Date().toISOString());
      }
    },
    [tasks, settings.notificationsEnabled, settings.soundEnabled, addToast]
  );

  // Trigger System ON check once tasks are loaded
  useEffect(() => {
    const timer = setTimeout(() => {
      runSystemOnCheck(false);
    }, 600);
    return () => clearTimeout(timer);
  }, [runSystemOnCheck]);

  // Accurate Alarm on Set Time & Early Reminders Check (runs every 10 seconds)
  useEffect(() => {
    const checkAlarms = () => {
      const today = getTodayString();
      const now = new Date();
      const currentHour = now.getHours();
      const currentMinute = now.getMinutes();

      tasks.forEach((task) => {
        if (task.status === "completed" || !task.scheduledDate) return;
        if (task.scheduledDate !== today) return;

        // 1. Exact Set-Time ALARM check
        if (task.scheduledTime) {
          const [th, tm] = task.scheduledTime.split(":").map(Number);
          const exactAlarmKey = `exact-alarm-${task.id}-${task.scheduledDate}-${task.scheduledTime}`;

          if (currentHour === th && currentMinute === tm && !firedRemindersRef.current.has(exactAlarmKey)) {
            firedRemindersRef.current.add(exactAlarmKey);
            setActiveAlarmTask(task);
            if (settings.notificationsEnabled) {
              sendTaskAlarmNotification(task, settings.soundEnabled);
            }
            addToast(
              "error",
              `ALARM: ${task.title}`,
              `Scheduled for ${formatTimeDisplay(task.scheduledTime)} · Priority: ${task.priority.toUpperCase()}`,
              task.id
            );
            return;
          }
        }

        // 2. Advance reminder offset (e.g. 5m, 10m, 15m, 30m, 1h before)
        if (task.reminderEnabled && task.scheduledTime) {
          const offset = task.reminderTime || settings.defaultReminderOffset || "15m";
          if (offset !== "at_time") {
            const [th, tm] = task.scheduledTime.split(":").map(Number);
            const reminderDate = new Date();
            reminderDate.setHours(th, tm, 0, 0);

            let offsetMin = 15;
            if (offset === "5m") offsetMin = 5;
            else if (offset === "10m") offsetMin = 10;
            else if (offset === "15m") offsetMin = 15;
            else if (offset === "30m") offsetMin = 30;
            else if (offset === "1h") offsetMin = 60;

            reminderDate.setMinutes(reminderDate.getMinutes() - offsetMin);
            const reminderKey = `offset-reminder-${task.id}-${task.scheduledDate}-${offset}`;

            const diff = now.getTime() - reminderDate.getTime();
            if (diff >= 0 && diff < 60000 && !firedRemindersRef.current.has(reminderKey)) {
              firedRemindersRef.current.add(reminderKey);
              if (settings.notificationsEnabled) {
                sendTaskNotification(task, settings.soundEnabled);
              }
              addToast(
                "warning",
                `Reminder (${offset} before): ${task.title}`,
                `Scheduled for ${formatTimeDisplay(task.scheduledTime)} · Priority: ${task.priority.toUpperCase()}`,
                task.id
              );
            }
          }
        }
      });
    };

    checkAlarms();
    const interval = setInterval(checkAlarms, 10000);
    return () => clearInterval(interval);
  }, [tasks, settings, addToast]);

  // Alarm action handlers
  const dismissAlarm = useCallback(() => {
    stopAlarmSound();
    setActiveAlarmTask(null);
  }, []);

  const snoozeAlarm = useCallback(
    (taskId: string, minutes = 5) => {
      stopAlarmSound();
      setActiveAlarmTask(null);
      const now = new Date();
      now.setMinutes(now.getMinutes() + minutes);
      const hh = String(now.getHours()).padStart(2, "0");
      const mm = String(now.getMinutes()).padStart(2, "0");
      const newTime = `${hh}:${mm}`;

      setTasks((prev) =>
        prev.map((t) =>
          t.id === taskId
            ? { ...t, scheduledTime: newTime, updatedAt: new Date().toISOString() }
            : t
        )
      );
      addToast(
        "info",
        "Alarm Snoozed",
        `Task alarm snoozed for ${minutes} minutes (will ring at ${formatTimeDisplay(newTime)}).`
      );
    },
    [addToast]
  );

  // Enable Desktop Notifications & Audible Alarms directly
  const enableDesktopNotifications = useCallback(async () => {
    const perm = await requestNotificationPermission();
    setPermissionState(perm);
    if (perm === "granted") {
      setSettings((prev) => ({ ...prev, notificationsEnabled: true }));
      sendTestNotification(settings.soundEnabled);
      addToast(
        "success",
        "Desktop Notifications & Alarms Enabled",
        "Audible alarms and desktop notifications are now active."
      );
      return true;
    } else if (perm === "denied") {
      addToast(
        "error",
        "Notifications Blocked",
        "Browser notifications were blocked. Please enable them in your browser URL bar."
      );
      return false;
    }
    return false;
  }, [settings.soundEnabled, addToast]);

  const testAlarm = useCallback(() => {
    sendTestNotification(settings.soundEnabled);
    addToast(
      "info",
      "Test Alarm Triggered",
      "Playing alarm chime and firing desktop notification."
    );
  }, [settings.soundEnabled, addToast]);

  const rescheduleAllOverdueToToday = useCallback(() => {
    const today = getTodayString();
    setTasks((prev) =>
      prev.map((t) => {
        if (t.status !== "completed" && isOverdue(t.scheduledDate, t.scheduledTime, t.status)) {
          return {
            ...t,
            scheduledDate: today,
            updatedAt: new Date().toISOString(),
          };
        }
        return t;
      })
    );
    addToast("success", "Overdue Tasks Rescheduled", "All overdue tasks moved to Today.");
    setSystemOnAlert(null);
  }, [addToast]);


  // Priority ranking helper
  const priorityRank = useCallback((p: Priority): number => {
    switch (p) {
      case "urgent":
        return 1;
      case "high":
        return 2;
      case "medium":
        return 3;
      case "low":
        return 4;
      default:
        return 5;
    }
  }, []);

  // Summary counts
  const summaryCounts = useMemo(() => {
    let todayCount = 0;
    let urgentCount = 0;
    let overdueCount = 0;
    let completedCount = 0;
    let totalPending = 0;

    tasks.forEach((task) => {
      const overdue = isOverdue(task.scheduledDate, task.scheduledTime, task.status);
      const isTodayTask = isToday(task.scheduledDate);

      if (task.status === "completed") {
        completedCount++;
      } else {
        totalPending++;
        if (isTodayTask || overdue) {
          todayCount++;
        }
        if (task.priority === "urgent") {
          urgentCount++;
        }
        if (overdue) {
          overdueCount++;
        }
      }
    });

    return {
      today: todayCount,
      urgent: urgentCount,
      overdue: overdueCount,
      completed: completedCount,
      pending: totalPending,
      total: tasks.length,
    };
  }, [tasks]);

  // "What's Next?" Smart Task Recommendation
  const whatsNextTask = useMemo(() => {
    const activeTasks = tasks.filter((t) => t.status !== "completed");
    if (activeTasks.length === 0) return null;

    // 1. Any task currently "in_progress"? Continue it!
    const inProgress = activeTasks.find((t) => t.status === "in_progress");
    if (inProgress) return inProgress;

    // 2. Overdue tasks, highest priority first
    const overdueTasks = activeTasks
      .filter((t) => isOverdue(t.scheduledDate, t.scheduledTime, t.status))
      .sort((a, b) => {
        const pDiff = priorityRank(a.priority) - priorityRank(b.priority);
        if (pDiff !== 0) return pDiff;
        return (a.scheduledTime || "99:99").localeCompare(b.scheduledTime || "99:99");
      });
    if (overdueTasks.length > 0) return overdueTasks[0];

    // 3. Urgent tasks for Today
    const todayUrgent = activeTasks
      .filter((t) => isToday(t.scheduledDate) && t.priority === "urgent")
      .sort((a, b) => (a.scheduledTime || "99:99").localeCompare(b.scheduledTime || "99:99"));
    if (todayUrgent.length > 0) return todayUrgent[0];

    // 4. Any tasks for Today sorted by time and priority
    const todayTasks = activeTasks
      .filter((t) => isToday(t.scheduledDate))
      .sort((a, b) => {
        const pDiff = priorityRank(a.priority) - priorityRank(b.priority);
        if (pDiff !== 0) return pDiff;
        return (a.scheduledTime || "99:99").localeCompare(b.scheduledTime || "99:99");
      });
    if (todayTasks.length > 0) return todayTasks[0];

    // 5. Highest priority overall
    const highestPriority = [...activeTasks].sort(
      (a, b) => priorityRank(a.priority) - priorityRank(b.priority)
    );
    return highestPriority[0] || null;
  }, [tasks, priorityRank]);

  // Filtered and Sorted tasks
  const filteredTasks = useMemo(() => {
    let list = [...tasks];

    // 1. Filter by Status / View filter
    if (activeFilter === "today") {
      list = list.filter((t) => isToday(t.scheduledDate) || isOverdue(t.scheduledDate, t.scheduledTime, t.status));
    } else if (activeFilter === "urgent") {
      list = list.filter((t) => t.priority === "urgent" && t.status !== "completed");
    } else if (activeFilter === "overdue") {
      list = list.filter((t) => isOverdue(t.scheduledDate, t.scheduledTime, t.status));
    } else if (activeFilter === "pending") {
      list = list.filter((t) => t.status === "pending");
    } else if (activeFilter === "in_progress") {
      list = list.filter((t) => t.status === "in_progress");
    } else if (activeFilter === "waiting") {
      list = list.filter((t) => t.status === "waiting");
    } else if (activeFilter === "completed") {
      list = list.filter((t) => t.status === "completed");
    }

    // 2. Filter by Category
    if (selectedCategory !== "all") {
      list = list.filter((t) => t.category.toLowerCase() === selectedCategory.toLowerCase());
    }

    // 3. Filter by Search Query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (t) =>
          t.title.toLowerCase().includes(q) ||
          (t.description && t.description.toLowerCase().includes(q)) ||
          t.category.toLowerCase().includes(q) ||
          (t.tags && t.tags.some((tag) => tag.toLowerCase().includes(q)))
      );
    }

    // 4. Sort
    list.sort((a, b) => {
      // Completed tasks sink to the bottom in general lists unless specifically in "completed" view
      if (activeFilter !== "completed") {
        if (a.status === "completed" && b.status !== "completed") return 1;
        if (a.status !== "completed" && b.status === "completed") return -1;
      }

      if (sortOption === "manual") {
        return (a.order ?? 0) - (b.order ?? 0);
      }

      if (sortOption === "smart") {
        // Overdue first
        const aOverdue = isOverdue(a.scheduledDate, a.scheduledTime, a.status);
        const bOverdue = isOverdue(b.scheduledDate, b.scheduledTime, b.status);
        if (aOverdue && !bOverdue) return -1;
        if (!aOverdue && bOverdue) return 1;

        // Today's scheduled
        const aToday = isToday(a.scheduledDate);
        const bToday = isToday(b.scheduledDate);
        if (aToday && !bToday) return -1;
        if (!aToday && bToday) return 1;

        // Priority
        const pDiff = priorityRank(a.priority) - priorityRank(b.priority);
        if (pDiff !== 0) return pDiff;

        // Scheduled time
        if (a.scheduledTime && b.scheduledTime) {
          return a.scheduledTime.localeCompare(b.scheduledTime);
        }
        if (a.scheduledTime && !b.scheduledTime) return -1;
        if (!a.scheduledTime && b.scheduledTime) return 1;

        // Date
        if (a.scheduledDate && b.scheduledDate) {
          return a.scheduledDate.localeCompare(b.scheduledDate);
        }

        return (a.order ?? 0) - (b.order ?? 0);
      }

      if (sortOption === "priority") {
        const pDiff = priorityRank(a.priority) - priorityRank(b.priority);
        if (pDiff !== 0) return pDiff;
        return (a.scheduledTime || "99:99").localeCompare(b.scheduledTime || "99:99");
      }

      if (sortOption === "time_asc") {
        const aTime = `${a.scheduledDate || "9999-99-99"} ${a.scheduledTime || "23:59"}`;
        const bTime = `${b.scheduledDate || "9999-99-99"} ${b.scheduledTime || "23:59"}`;
        return aTime.localeCompare(bTime);
      }

      if (sortOption === "time_desc") {
        const aTime = `${a.scheduledDate || "0000-00-00"} ${a.scheduledTime || "00:00"}`;
        const bTime = `${b.scheduledDate || "0000-00-00"} ${b.scheduledTime || "00:00"}`;
        return bTime.localeCompare(aTime);
      }

      if (sortOption === "created_desc") {
        return b.createdAt.localeCompare(a.createdAt);
      }

      if (sortOption === "updated_desc") {
        return b.updatedAt.localeCompare(a.updatedAt);
      }

      if (sortOption === "alpha_asc") {
        return a.title.localeCompare(b.title);
      }

      return 0;
    });

    return list;
  }, [tasks, activeFilter, selectedCategory, searchQuery, sortOption, priorityRank]);

  // Today specific tasks (sorted for Today View)
  const todayViewTasks = useMemo(() => {
    return tasks
      .filter((t) => isToday(t.scheduledDate) || isOverdue(t.scheduledDate, t.scheduledTime, t.status))
      .sort((a, b) => {
        // In Today view: Overdue -> Priority -> Scheduled time
        const aOverdue = isOverdue(a.scheduledDate, a.scheduledTime, a.status);
        const bOverdue = isOverdue(b.scheduledDate, b.scheduledTime, b.status);
        if (aOverdue && !bOverdue) return -1;
        if (!aOverdue && bOverdue) return 1;

        if (a.scheduledTime && b.scheduledTime) {
          return a.scheduledTime.localeCompare(b.scheduledTime);
        }
        if (a.scheduledTime && !b.scheduledTime) return -1;
        if (!a.scheduledTime && b.scheduledTime) return 1;

        return priorityRank(a.priority) - priorityRank(b.priority);
      });
  }, [tasks, priorityRank]);

  // Task Actions
  const addTask = useCallback(
    (taskData: Omit<Task, "id" | "createdAt" | "updatedAt">) => {
      const now = new Date().toISOString();
      const newTask: Task = {
        ...taskData,
        id: `task-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
        createdAt: now,
        updatedAt: now,
        order: 1,
      };

      setTasks((prev) => {
        const nextList = [newTask, ...prev];
        return nextList.map((t, idx) => ({ ...t, order: idx + 1 }));
      });
      addToast("success", "Task added", newTask.title);
      return newTask;
    },
    [addToast]
  );

  const updateTask = useCallback(
    (id: string, updates: Partial<Task>, quiet = false) => {
      setTasks((prev) =>
        prev.map((t) => {
          if (t.id !== id) return t;
          const updated: Task = {
            ...t,
            ...updates,
            updatedAt: new Date().toISOString(),
          };
          if (updates.status === "completed" && t.status !== "completed") {
            updated.completedAt = new Date().toISOString();
          } else if (updates.status && updates.status !== "completed") {
            updated.completedAt = undefined;
          }
          return updated;
        })
      );
      // Only toast for explicit user modal updates, not live background note typing
      if (!quiet && !updates.notes && !updates.description) {
        addToast("info", "Task updated");
      }
    },
    [addToast]
  );

  const deleteTask = useCallback(
    (id: string) => {
      const taskToDelete = tasks.find((t) => t.id === id);
      setTasks((prev) => {
        const remaining = prev.filter((t) => t.id !== id);
        return remaining.map((t, idx) => ({ ...t, order: idx + 1 }));
      });
      addToast("info", "Task deleted", taskToDelete?.title);
    },
    [tasks, addToast]
  );

  const toggleComplete = useCallback(
    (id: string) => {
      setTasks((prev) =>
        prev.map((t) => {
          if (t.id !== id) return t;
          const willComplete = t.status !== "completed";
          if (willComplete && settings.soundEnabled) {
            playCompleteSound();
          }
          return {
            ...t,
            status: willComplete ? "completed" : "pending",
            completedAt: willComplete ? new Date().toISOString() : undefined,
            updatedAt: new Date().toISOString(),
          };
        })
      );
    },
    [settings.soundEnabled]
  );

  const setTaskStatus = useCallback(
    (id: string, status: TaskStatus) => {
      setTasks((prev) =>
        prev.map((t) => {
          if (t.id !== id) return t;
          const willComplete = status === "completed";
          if (willComplete && t.status !== "completed" && settings.soundEnabled) {
            playCompleteSound();
          }
          return {
            ...t,
            status,
            completedAt: willComplete ? new Date().toISOString() : undefined,
            updatedAt: new Date().toISOString(),
          };
        })
      );
    },
    [settings.soundEnabled]
  );

  const rescheduleTask = useCallback(
    (id: string, scheduledDate?: string, scheduledTime?: string) => {
      setTasks((prev) =>
        prev.map((t) => {
          if (t.id !== id) return t;
          return {
            ...t,
            scheduledDate,
            scheduledTime,
            updatedAt: new Date().toISOString(),
          };
        })
      );
      addToast("success", "Task rescheduled");
    },
    [addToast]
  );

  const setTaskPriority = useCallback((id: string, priority: Priority) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, priority, updatedAt: new Date().toISOString() } : t))
    );
  }, []);

  const reorderTasks = useCallback((startIndex: number, endIndex: number) => {
    setTasks((prev) => {
      const result = Array.from(prev);
      const [removed] = result.splice(startIndex, 1);
      result.splice(endIndex, 0, removed);
      // update order field
      return result.map((t, idx) => ({ ...t, order: idx + 1 }));
    });
  }, []);

  const reorderTaskById = useCallback(
    (sourceId: string, targetId: string, placeAfter = false) => {
      setTasks((prev) => {
        // Guarantee clean alignment with displayed 1, 2, 3, 4 positions
        const sorted = [...prev].sort((a, b) => (a.order ?? 999) - (b.order ?? 999));
        const sourceIndex = sorted.findIndex((t) => t.id === sourceId);
        const targetIndex = sorted.findIndex((t) => t.id === targetId);
        if (sourceIndex === -1 || targetIndex === -1 || sourceIndex === targetIndex) return prev;

        const [removed] = sorted.splice(sourceIndex, 1);
        const newTargetIndex = sorted.findIndex((t) => t.id === targetId);
        const insertIndex = placeAfter ? newTargetIndex + 1 : newTargetIndex;
        sorted.splice(insertIndex, 0, removed);
        return sorted.map((t, idx) => ({ ...t, order: idx + 1 }));
      });
    },
    []
  );

  const moveTaskToPosition = useCallback(
    (taskId: string, targetPosition: number) => {
      setTasks((prev) => {
        const sorted = [...prev].sort((a, b) => (a.order ?? 999) - (b.order ?? 999));
        const sourceIndex = sorted.findIndex((t) => t.id === taskId);
        if (sourceIndex === -1) return prev;
        const [removed] = sorted.splice(sourceIndex, 1);
        const clampedIndex = Math.max(0, Math.min(sorted.length, targetPosition - 1));
        sorted.splice(clampedIndex, 0, removed);
        return sorted.map((t, idx) => ({ ...t, order: idx + 1 }));
      });
      addToast("info", `Moved task to position #${targetPosition}`);
    },
    [addToast]
  );

  const moveTaskDelta = useCallback((taskId: string, delta: -1 | 1) => {
    setTasks((prev) => {
      const sorted = [...prev].sort((a, b) => (a.order ?? 999) - (b.order ?? 999));
      const sourceIndex = sorted.findIndex((t) => t.id === taskId);
      if (sourceIndex === -1) return prev;
      const targetIndex = sourceIndex + delta;
      if (targetIndex < 0 || targetIndex >= sorted.length) return prev;
      const [removed] = sorted.splice(sourceIndex, 1);
      sorted.splice(targetIndex, 0, removed);
      return sorted.map((t, idx) => ({ ...t, order: idx + 1 }));
    });
  }, []);

  const clearCompleted = useCallback(() => {
    const completedCount = tasks.filter((t) => t.status === "completed").length;
    setTasks((prev) => prev.filter((t) => t.status !== "completed"));
    addToast("info", `Cleared ${completedCount} completed task${completedCount === 1 ? "" : "s"}`);
  }, [tasks, addToast]);

  const resetToDemoData = useCallback(() => {
    const demo = generateSampleTasks();
    setTasks(demo);
    addToast("success", "Reset to sample demo data", `${demo.length} tasks restored`);
  }, [addToast]);

  const exportData = useCallback(() => {
    exportTasksAsJSON(tasks);
    addToast("success", "Exported tasks as JSON file");
  }, [tasks, addToast]);

  const importData = useCallback(
    (jsonData: unknown): ImportResult => {
      const result = validateAndImportTasks(jsonData);
      if (result.success && result.validTasks.length > 0) {
        setTasks(result.validTasks);
        addToast(
          "success",
          "Import successful",
          `${result.restoredCount} tasks restored.${
            result.skippedCount > 0 ? ` (${result.skippedCount} skipped)` : ""
          }`
        );
      } else {
        addToast("error", "Import failed", result.message);
      }
      return result;
    },
    [addToast]
  );

  const updateSettings = useCallback(
    (newSettings: Partial<AppSettings>) => {
      setSettings((prev) => ({ ...prev, ...newSettings }));
      addToast("info", "Settings saved");
    },
    [addToast]
  );

  return {
    tasks,
    filteredTasks,
    todayViewTasks,
    summaryCounts,
    whatsNextTask,
    viewMode,
    setViewMode,
    activeFilter,
    setActiveFilter,
    selectedCategory,
    setSelectedCategory,
    searchQuery,
    setSearchQuery,
    sortOption,
    setSortOption,
    toasts,
    removeToast,
    addTask,
    updateTask,
    deleteTask,
    toggleComplete,
    setTaskStatus,
    rescheduleTask,
    setTaskPriority,
    reorderTasks,
    reorderTaskById,
    moveTaskToPosition,
    moveTaskDelta,
    clearCompleted,
    resetToDemoData,
    exportData,
    importData,
    settings,
    updateSettings,
    activeAlarmTask,
    dismissAlarm,
    snoozeAlarm,
    systemOnAlert,
    setSystemOnAlert,
    runSystemOnCheck,
    rescheduleAllOverdueToToday,
    permissionState,
    enableDesktopNotifications,
    testAlarm,
  };
}
