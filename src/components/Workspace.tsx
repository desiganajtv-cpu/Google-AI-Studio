import React, { useState, useMemo, useRef } from "react";
import { Task, Priority, AppSettings } from "../types/task";
import {
  isOverdue,
  isToday,
  getTodayString,
  getTomorrowString,
  formatHeaderDate,
  formatTimeDisplay,
} from "../utils/dateUtils";
import { parseNaturalLanguageTask } from "../utils/naturalLanguageParser";
import {
  Trash2,
  Check,
  Clock,
  Bell,
  BellOff,
  Volume2,
  VolumeX,
  Sun,
  Moon,
  Laptop,
  Settings as SettingsIcon,
  RotateCcw,
  Calendar,
  AlertCircle,
  Plus,
  SlidersHorizontal,
  Edit2,
  CheckCircle2,
  Search,
  Filter,
  GripVertical,
  ArrowUp,
  ArrowDown,
  ArrowUpDown,
  Hash,
  X,
  StickyNote,
  ChevronDown,
  ChevronUp,
  FileText,
} from "lucide-react";
import { TaskStatus } from "../types/task";

interface TaskNotepadProps {
  task: Task;
  onUpdate: (updates: Partial<Task>) => void;
  onToggleComplete: () => void;
  onClose: () => void;
}

const TaskNotepad: React.FC<TaskNotepadProps> = ({ task, onUpdate, onToggleComplete, onClose }) => {
  const [noteContent, setNoteContent] = useState(task.notes || task.description || "");
  const [saveStatus, setSaveStatus] = useState<"saved" | "saving">("saved");
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Sync if task changes externally
  React.useEffect(() => {
    setNoteContent(task.notes || task.description || "");
  }, [task.notes, task.description]);

  const handleNotesChange = (val: string) => {
    setNoteContent(val);
    setSaveStatus("saving");
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    saveTimeoutRef.current = setTimeout(() => {
      onUpdate({ notes: val, description: val });
      setSaveStatus("saved");
    }, 350);
  };

  const insertSnippet = (snippet: string) => {
    const updated = noteContent ? `${noteContent}\n${snippet}` : snippet;
    handleNotesChange(updated);
  };

  const handleStatusSelect = (status: TaskStatus) => {
    onUpdate({ status });
    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    const dateStr = now.toLocaleDateString([], { month: "short", day: "numeric" });
    const label =
      status === "in_progress"
        ? "In Progress"
        : status === "waiting"
        ? "Waiting / Blocked"
        : status === "completed"
        ? "Completed"
        : "Pending";
    insertSnippet(`[Status Mention: ${label} · ${dateStr}, ${timeStr}]`);
  };

  const isCompleted = task.status === "completed";

  return (
    <div
      onClick={(e) => e.stopPropagation()}
      className="bg-[#FFFDF5] dark:bg-[#1A1A1E] rounded-2xl p-4 sm:p-5 border border-amber-200/50 dark:border-white/[0.08] shadow-sm space-y-3.5 transition-all"
    >
      {/* Header with Notepad title, save status, and collapse button */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-2.5 border-b border-amber-200/40 dark:border-white/[0.07]">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-amber-500/15 text-amber-600 dark:text-amber-400 flex items-center justify-center">
            <StickyNote className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h5 className="text-xs font-bold text-[#1C1C1F] dark:text-[#F3F3F5] tracking-wider uppercase">
                Task Notepad & Mentions
              </h5>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-md bg-black/5 dark:bg-white/10 text-[#66666D] dark:text-[#9A9AA2]">
                Auto-saved
              </span>
            </div>
            <p className="text-[11px] text-[#777780] dark:text-[#909098]">
              Mention current status updates, progress logs, and things to remember
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {saveStatus === "saving" ? (
            <span className="text-[11px] text-[#8E8E93] dark:text-[#A0A0A8] animate-pulse font-medium">
              Saving...
            </span>
          ) : (
            <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
              ✓ Saved
            </span>
          )}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onClose();
            }}
            title="Collapse notepad"
            className="text-xs font-bold text-[#55555B] dark:text-[#A0A0A8] hover:text-[#1C1C1F] dark:hover:text-white px-2.5 py-1 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 transition-colors flex items-center gap-1 cursor-pointer"
          >
            <ChevronUp className="w-3.5 h-3.5" />
            <span>Collapse</span>
          </button>
        </div>
      </div>

      {/* Current Status Mention Pills */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <label className="text-[11px] font-bold text-[#55555B] dark:text-[#A0A0A8] uppercase tracking-wider block">
            Current Status Mention:
          </label>
          <span className="text-[10px] text-[#888890]">
            Tap status to update & log to note
          </span>
        </div>
        <div className="flex flex-wrap items-center gap-1.5">
          {(
            [
              { id: "pending", label: "Pending", dot: "bg-amber-400" },
              { id: "in_progress", label: "In Progress", dot: "bg-blue-500" },
              { id: "waiting", label: "Waiting / Blocked", dot: "bg-purple-500" },
              { id: "completed", label: "Completed", dot: "bg-emerald-500" },
            ] as const
          ).map((s) => {
            const isSelected = task.status === s.id;
            return (
              <button
                key={s.id}
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleStatusSelect(s.id);
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  isSelected
                    ? "bg-[#1C1C1F] dark:bg-white text-white dark:text-[#1C1C1F] shadow-xs scale-102 ring-2 ring-black/10 dark:ring-white/20"
                    : "bg-white dark:bg-[#25252A] text-[#55555B] dark:text-[#9B9BA2] hover:text-[#1C1C1F] dark:hover:text-white border border-black/[0.05] dark:border-white/[0.06] hover:bg-black/5 dark:hover:bg-white/5"
                }`}
              >
                <span className={`w-2 h-2 rounded-full ${s.dot}`} />
                <span>{s.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Quick Mentions & Things to Remember Buttons */}
      <div className="space-y-1">
        <span className="text-[10px] font-semibold text-[#8E8E93] dark:text-[#888890] uppercase tracking-wider block">
          Things to Remember / Quick Inserts:
        </span>
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              insertSnippet("[Remember 📌: ");
            }}
            className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-amber-500/15 hover:bg-amber-500/25 text-amber-800 dark:text-amber-300 transition-colors cursor-pointer flex items-center gap-1"
          >
            <span>📌 Remember</span>
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              const timeStr = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
              const dateStr = new Date().toLocaleDateString([], { month: "short", day: "numeric" });
              insertSnippet(`[Status Update · ${dateStr}, ${timeStr}]: `);
            }}
            className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-blue-500/10 hover:bg-blue-500/20 text-blue-700 dark:text-blue-300 transition-colors cursor-pointer flex items-center gap-1"
          >
            <span>⚡ Status Update</span>
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              insertSnippet("[Next Action ➔]: ");
            }}
            className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-purple-500/10 hover:bg-purple-500/20 text-purple-700 dark:text-purple-300 transition-colors cursor-pointer flex items-center gap-1"
          >
            <span>➔ Next Action</span>
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              insertSnippet("[ ] ");
            }}
            className="px-2.5 py-1 rounded-lg text-xs font-medium bg-black/[0.05] dark:bg-white/[0.08] hover:bg-black/[0.08] dark:hover:bg-white/[0.14] text-[#44444A] dark:text-[#C0C0C8] transition-colors cursor-pointer"
          >
            + Checkbox [ ]
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              insertSnippet("• ");
            }}
            className="px-2.5 py-1 rounded-lg text-xs font-medium bg-black/[0.05] dark:bg-white/[0.08] hover:bg-black/[0.08] dark:hover:bg-white/[0.14] text-[#44444A] dark:text-[#C0C0C8] transition-colors cursor-pointer"
          >
            + Bullet •
          </button>
        </div>
      </div>

      {/* Notepad Ruled Canvas Textarea */}
      <div className="relative rounded-xl bg-white dark:bg-[#222226] border border-amber-200/60 dark:border-white/[0.08] p-3.5 shadow-2xs focus-within:ring-2 focus-within:ring-amber-500/30 dark:focus-within:ring-white/20 transition-all">
        <textarea
          value={noteContent}
          onChange={(e) => handleNotesChange(e.target.value)}
          placeholder="Mention current status, key blockers, deliverables, or things you want to remember..."
          rows={5}
          className="w-full bg-transparent text-xs sm:text-sm text-[#1C1C1F] dark:text-[#F3F3F5] placeholder-[#9E9EA4] dark:placeholder-[#6E6E76] focus:outline-none resize-y min-h-[110px] leading-relaxed font-sans"
        />
        <div className="flex items-center justify-between pt-2.5 border-t border-black/[0.04] dark:border-white/[0.05] text-[10px] text-[#8E8E93] dark:text-[#888890] font-mono">
          <span>
            {noteContent.trim()
              ? `${noteContent.trim().split(/\s+/).length} words · ${noteContent.length} chars`
              : "0 words · Clean notepad"}
          </span>
          {noteContent && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                if (window.confirm("Clear all notes for this task?")) {
                  handleNotesChange("");
                }
              }}
              className="text-[#FF3B30] hover:underline cursor-pointer font-sans text-[11px]"
            >
              Clear Note
            </button>
          )}
        </div>
      </div>

      {/* Notepad Action Footer: Mark Complete Circle Button & Done */}
      <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-amber-200/30 dark:border-white/[0.05]">
        {/* Mark Complete Circle Button inside Notepad */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onToggleComplete();
          }}
          className={`h-8 px-3 rounded-xl flex items-center gap-2 text-xs font-bold transition-all cursor-pointer ${
            isCompleted
              ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-400/30 hover:bg-emerald-500/25"
              : "bg-[#1C1C1F] dark:bg-white text-white dark:text-[#1C1C1F] hover:opacity-90 active:scale-95 shadow-xs"
          }`}
        >
          <div
            className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
              isCompleted
                ? "bg-emerald-500 border-emerald-500 text-white"
                : "border-white/70 dark:border-black/70"
            }`}
          >
            {isCompleted && <Check className="w-2.5 h-2.5 stroke-[3]" />}
          </div>
          <span>{isCompleted ? "Mark as Incomplete" : "Mark as Completed"}</span>
        </button>

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onClose();
          }}
          className="h-8 px-3 rounded-xl bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/15 text-[#1C1C1F] dark:text-white text-xs font-bold transition-all cursor-pointer"
        >
          Done
        </button>
      </div>
    </div>
  );
};

export interface WorkspaceProps {
  tasks: Task[];
  settings: AppSettings;
  permissionState: NotificationPermission | "unsupported";
  onAddTask: (taskData: Omit<Task, "id" | "createdAt" | "updatedAt">) => void;
  onUpdateTask: (id: string, updates: Partial<Task>) => void;
  onToggleComplete: (id: string) => void;
  onEditTask: (task: Task) => void;
  onDeleteTask: (id: string) => void;
  onReorderTasks: (sourceId: string, targetId: string, placeAfter?: boolean) => void;
  onMoveTaskToPosition: (taskId: string, targetPosition: number) => void;
  onMoveTaskDelta: (taskId: string, delta: -1 | 1) => void;
  onRescheduleOverdueToToday: () => void;
  onClearCompleted: () => void;
  onOpenQuickAddModal: () => void;
  onOpenSettings: () => void;
  onToggleSound: () => void;
  onCycleTheme: () => void;
  onEnableNotifications: () => void;
}

export const Workspace: React.FC<WorkspaceProps> = ({
  tasks,
  settings,
  permissionState,
  onAddTask,
  onUpdateTask,
  onToggleComplete,
  onEditTask,
  onDeleteTask,
  onReorderTasks,
  onMoveTaskToPosition,
  onMoveTaskDelta,
  onRescheduleOverdueToToday,
  onClearCompleted,
  onOpenQuickAddModal,
  onOpenSettings,
  onToggleSound,
  onCycleTheme,
  onEnableNotifications,
}) => {
  // Quick Input State
  const [newTitle, setNewTitle] = useState("");
  const [showAdvancedAdd, setShowAdvancedAdd] = useState(false);
  const [newDate, setNewDate] = useState<string>(getTodayString());
  const [newTime, setNewTime] = useState<string>("");
  const [newAlarmEnabled, setNewAlarmEnabled] = useState<boolean>(true);
  const [newPriority, setNewPriority] = useState<Priority>("medium");
  const [newCategory, setNewCategory] = useState<string>(settings.categories[0] || "General");
  const inputRef = useRef<HTMLInputElement>(null);

  // Filter & Search State
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<"all" | "today" | "pending" | "completed">("all");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [sortBy, setSortBy] = useState<"position" | "priority" | "time">("position");

  // Drag & Position State
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [dropTarget, setDropTarget] = useState<{ id: string; placeAfter: boolean } | null>(null);
  const [isPointerDragging, setIsPointerDragging] = useState(false);
  const [positionModalTask, setPositionModalTask] = useState<Task | null>(null);
  const [customPositionInput, setCustomPositionInput] = useState("");

  // Expandable Notepad State
  const [expandedTaskIds, setExpandedTaskIds] = useState<Record<string, boolean>>({});

  const toggleExpandTask = (taskId: string) => {
    setExpandedTaskIds((prev) => ({
      ...prev,
      [taskId]: !prev[taskId],
    }));
  };

  const currentDateStr = formatHeaderDate();

  // Summary counts
  const overdueCount = useMemo(
    () => tasks.filter((t) => t.status !== "completed" && isOverdue(t.scheduledDate, t.scheduledTime, t.status)).length,
    [tasks]
  );
  const todayCount = useMemo(
    () => tasks.filter((t) => t.status !== "completed" && isToday(t.scheduledDate)).length,
    [tasks]
  );
  const pendingCount = useMemo(
    () => tasks.filter((t) => t.status !== "completed").length,
    [tasks]
  );
  const completedCount = useMemo(
    () => tasks.filter((t) => t.status === "completed").length,
    [tasks]
  );

  // Filtered & sorted task list
  const filteredTasks = useMemo(() => {
    return tasks
      .filter((t) => {
        if (activeFilter === "today") return isToday(t.scheduledDate) && t.status !== "completed";
        if (activeFilter === "pending") return t.status !== "completed";
        if (activeFilter === "completed") return t.status === "completed";
        return true;
      })
      .filter((t) => {
        if (selectedCategory === "all") return true;
        return t.category === selectedCategory;
      })
      .filter((t) => {
        if (!searchQuery.trim()) return true;
        const q = searchQuery.toLowerCase();
        return (
          t.title.toLowerCase().includes(q) ||
          t.category.toLowerCase().includes(q) ||
          (t.description && t.description.toLowerCase().includes(q))
        );
      })
      .sort((a, b) => {
        // Completed sink to bottom in non-completed views
        if (activeFilter !== "completed") {
          if (a.status === "completed" && b.status !== "completed") return 1;
          if (a.status !== "completed" && b.status === "completed") return -1;
        }

        // Custom Position (1, 2, 3...)
        if (sortBy === "position") {
          return (a.order ?? 999) - (b.order ?? 999);
        }

        // Priority weighting
        if (sortBy === "priority") {
          const prioRank = (p: Priority) => (p === "urgent" ? 4 : p === "high" ? 3 : p === "medium" ? 2 : 1);
          if (prioRank(a.priority) !== prioRank(b.priority)) {
            return prioRank(b.priority) - prioRank(a.priority);
          }
          return (a.order ?? 999) - (b.order ?? 999);
        }

        // Scheduled Time
        if (sortBy === "time") {
          const aTime = `${a.scheduledDate || "9999"} ${a.scheduledTime || "23:59"}`;
          const bTime = `${b.scheduledDate || "9999"} ${b.scheduledTime || "23:59"}`;
          return aTime.localeCompare(bTime);
        }

        return (a.order ?? 999) - (b.order ?? 999);
      });
  }, [tasks, activeFilter, selectedCategory, searchQuery, sortBy]);

  // HTML5 Drag and Drop Handlers
  const handleDragStart = (e: React.DragEvent, taskId: string) => {
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", taskId);
    setDraggedId(taskId);
  };

  const handleDragOver = (e: React.DragEvent, taskId: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    if (!draggedId || draggedId === taskId) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const placeAfter = e.clientY - rect.top > rect.height / 2;
    setDropTarget({ id: taskId, placeAfter });
  };

  const handleDrop = (e: React.DragEvent, taskId: string) => {
    e.preventDefault();
    e.stopPropagation();
    const sourceId = draggedId || e.dataTransfer.getData("text/plain");
    if (sourceId && sourceId !== taskId) {
      const rect = e.currentTarget.getBoundingClientRect();
      const placeAfter = e.clientY - rect.top > rect.height / 2;
      onReorderTasks(sourceId, taskId, placeAfter);
      if (sortBy !== "position") setSortBy("position");
    }
    setDraggedId(null);
    setDropTarget(null);
  };

  const handleDragEnd = () => {
    setDraggedId(null);
    setDropTarget(null);
  };

  // Mobile / Touch Pointer Drag Handlers
  const handlePointerDown = (e: React.PointerEvent, taskId: string) => {
    if (e.button !== 0 && e.pointerType === "mouse") return;
    try {
      (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    } catch {
      // ignore
    }
    setDraggedId(taskId);
    setIsPointerDragging(true);
  };

  const handlePointerMove = (e: React.PointerEvent, taskId: string) => {
    if (!isPointerDragging || draggedId !== taskId) return;
    const el = document.elementFromPoint(e.clientX, e.clientY);
    const cardEl = el?.closest("[data-task-id]") as HTMLElement | null;
    if (cardEl) {
      const targetId = cardEl.getAttribute("data-task-id");
      if (targetId && targetId !== taskId) {
        const rect = cardEl.getBoundingClientRect();
        const placeAfter = e.clientY - rect.top > rect.height / 2;
        setDropTarget({ id: targetId, placeAfter });
      }
    }
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (isPointerDragging && draggedId) {
      const el = document.elementFromPoint(e.clientX, e.clientY);
      const cardEl = el?.closest("[data-task-id]") as HTMLElement | null;
      const targetId = cardEl?.getAttribute("data-task-id") || dropTarget?.id;
      if (targetId && targetId !== draggedId) {
        let placeAfter = dropTarget?.placeAfter ?? false;
        if (cardEl) {
          const rect = cardEl.getBoundingClientRect();
          placeAfter = e.clientY - rect.top > rect.height / 2;
        }
        onReorderTasks(draggedId, targetId, placeAfter);
        if (sortBy !== "position") setSortBy("position");
      }
    }
    setIsPointerDragging(false);
    setDraggedId(null);
    setDropTarget(null);
  };

  // Handle Quick Add Submit
  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    // Automatic Natural language parsing
    const parsed = parseNaturalLanguageTask(newTitle, settings.categories);
    const finalTitle = parsed.title || newTitle.trim();
    const finalDate = parsed.scheduledDate || newDate || getTodayString();
    const finalTime = parsed.scheduledTime || newTime || undefined;
    const finalPriority = parsed.priority || newPriority;
    const finalCategory = parsed.category || newCategory;

    onAddTask({
      title: finalTitle,
      category: finalCategory,
      priority: finalPriority,
      status: "pending",
      scheduledDate: finalDate,
      scheduledTime: finalTime,
      reminderEnabled: newAlarmEnabled && !!finalTime,
      reminderTime: "at_time",
    });

    setNewTitle("");
    setNewTime("");
    setShowAdvancedAdd(false);
    inputRef.current?.focus();
  };

  return (
    <main className="w-full min-h-screen bg-[#DCDCE0] dark:bg-[#141416] text-[#1C1C1F] dark:text-[#F3F3F5] px-4 py-6 sm:px-6 md:px-10 md:py-10 transition-colors duration-200">
      {/* Max container for responsive tablet & desktop presentation */}
      <div className="max-w-4xl mx-auto space-y-6 sm:space-y-8">
        
        {/* Top Header & Navigation Bar */}
        <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-black/[0.06] dark:border-white/[0.08]">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-wider text-[#1C1C1F] dark:text-[#F3F3F5] uppercase select-none">
                TO DO
              </h1>
              {pendingCount > 0 && (
                <span className="px-2.5 py-0.5 rounded-full bg-white dark:bg-[#222226] text-xs font-bold text-[#1C1C1F] dark:text-white shadow-2xs border border-black/[0.05] dark:border-white/[0.08]">
                  {pendingCount}
                </span>
              )}
            </div>
            <p className="text-xs sm:text-sm font-medium text-[#686870] dark:text-[#9A9AA2] mt-1">
              {currentDateStr} · {pendingCount} pending task{pendingCount === 1 ? "" : "s"}
            </p>
          </div>

          {/* Action Toolbar */}
          <div className="flex items-center gap-1.5 sm:gap-2 self-start sm:self-auto bg-white/70 dark:bg-[#222226]/70 backdrop-blur-md p-1.5 rounded-2xl border border-black/[0.05] dark:border-white/[0.06] shadow-xs">
            {/* Desktop Notifications Bell */}
            <button
              id="btn-desktop-notifications"
              onClick={onEnableNotifications}
              title={
                settings.notificationsEnabled && permissionState === "granted"
                  ? "Notifications & Alarms: ACTIVE (click to test)"
                  : "Notifications & Alarms: Click to Enable"
              }
              className={`h-8 px-2.5 rounded-xl flex items-center gap-1.5 text-xs font-semibold transition-all cursor-pointer ${
                settings.notificationsEnabled && permissionState === "granted"
                  ? "text-[#1C1C1F] dark:text-white hover:bg-black/5 dark:hover:bg-white/10"
                  : "text-[#FF9500] bg-[#FF9500]/15 ring-1 ring-[#FF9500]/30"
              }`}
            >
              {settings.notificationsEnabled && permissionState === "granted" ? (
                <Bell className="w-4 h-4" />
              ) : (
                <BellOff className="w-4 h-4" />
              )}
              <span className="hidden md:inline">
                {settings.notificationsEnabled && permissionState === "granted" ? "Alarms On" : "Enable Alarms"}
              </span>
            </button>

            {/* Sound Toggle */}
            <button
              id="btn-toggle-sound"
              onClick={onToggleSound}
              title={settings.soundEnabled ? "Audio chimes & alarms on" : "Audio muted"}
              className="w-8 h-8 rounded-xl flex items-center justify-center text-[#4A4A50] hover:text-[#1A1A1A] dark:text-[#A0A0A8] dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/10 transition-colors cursor-pointer"
            >
              {settings.soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>

            {/* Theme Toggle */}
            <button
              id="btn-toggle-theme"
              onClick={onCycleTheme}
              title={`Theme: ${settings.theme.toUpperCase()}`}
              className="w-8 h-8 rounded-xl flex items-center justify-center text-[#4A4A50] hover:text-[#1A1A1A] dark:text-[#A0A0A8] dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/10 transition-colors cursor-pointer"
            >
              {settings.theme === "dark" ? (
                <Moon className="w-4 h-4 text-[#818CF8]" />
              ) : settings.theme === "light" ? (
                <Sun className="w-4 h-4 text-[#F59E0B]" />
              ) : (
                <Laptop className="w-4 h-4" />
              )}
            </button>

            {/* Clear Completed */}
            {completedCount > 0 && (
              <button
                id="btn-clear-completed"
                onClick={onClearCompleted}
                title={`Clear ${completedCount} completed tasks`}
                className="h-8 px-2.5 rounded-xl flex items-center gap-1 text-xs font-semibold text-[#10B981] hover:bg-[#10B981]/15 transition-colors cursor-pointer"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span className="hidden lg:inline">Clear Done</span>
              </button>
            )}

            {/* Detailed Modal Quick Add */}
            <button
              id="btn-open-quick-add"
              onClick={onOpenQuickAddModal}
              title="Add task with full options"
              className="h-8 px-3 rounded-xl bg-[#1C1C1F] dark:bg-white text-white dark:text-[#1C1C1F] text-xs font-bold flex items-center gap-1.5 shadow-xs hover:opacity-90 active:scale-95 transition-all cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>New Task</span>
            </button>

            {/* Settings */}
            <button
              id="btn-open-settings"
              onClick={onOpenSettings}
              title="Workspace Preferences"
              className="w-8 h-8 rounded-xl flex items-center justify-center text-[#4A4A50] hover:text-[#1A1A1A] dark:text-[#A0A0A8] dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/10 transition-colors cursor-pointer"
            >
              <SettingsIcon className="w-4 h-4" />
            </button>
          </div>
        </header>

        {/* Quick Stats Metric Cards (Responsive Grid) */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          <button
            type="button"
            onClick={() => setActiveFilter("all")}
            className={`p-3.5 sm:p-4 rounded-2xl bg-white dark:bg-[#222226] text-left border transition-all cursor-pointer shadow-xs ${
              activeFilter === "all"
                ? "border-[#1C1C1F] dark:border-white ring-2 ring-black/10 dark:ring-white/20"
                : "border-black/[0.04] dark:border-white/[0.06] hover:border-black/20"
            }`}
          >
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#686870] dark:text-[#9A9AA2] block">
              All Tasks
            </span>
            <span className="text-xl sm:text-2xl font-black text-[#1C1C1F] dark:text-white mt-0.5 block">
              {tasks.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveFilter("today")}
            className={`p-3.5 sm:p-4 rounded-2xl bg-white dark:bg-[#222226] text-left border transition-all cursor-pointer shadow-xs ${
              activeFilter === "today"
                ? "border-[#1C1C1F] dark:border-white ring-2 ring-black/10 dark:ring-white/20"
                : "border-black/[0.04] dark:border-white/[0.06] hover:border-black/20"
            }`}
          >
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#686870] dark:text-[#9A9AA2] block">
              Due Today
            </span>
            <span className="text-xl sm:text-2xl font-black text-[#1C1C1F] dark:text-white mt-0.5 block">
              {todayCount}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveFilter("pending")}
            className={`p-3.5 sm:p-4 rounded-2xl bg-white dark:bg-[#222226] text-left border transition-all cursor-pointer shadow-xs ${
              overdueCount > 0 ? "border-[#FF9500]/50 bg-[#FF9500]/5" : ""
            } ${
              activeFilter === "pending"
                ? "border-[#1C1C1F] dark:border-white ring-2 ring-black/10 dark:ring-white/20"
                : "border-black/[0.04] dark:border-white/[0.06] hover:border-black/20"
            }`}
          >
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#686870] dark:text-[#9A9AA2] flex items-center justify-between">
              <span>Pending</span>
              {overdueCount > 0 && <span className="text-[#FF9500] font-black">{overdueCount} Late</span>}
            </span>
            <span className="text-xl sm:text-2xl font-black text-[#1C1C1F] dark:text-white mt-0.5 block">
              {pendingCount}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveFilter("completed")}
            className={`p-3.5 sm:p-4 rounded-2xl bg-white dark:bg-[#222226] text-left border transition-all cursor-pointer shadow-xs ${
              activeFilter === "completed"
                ? "border-[#1C1C1F] dark:border-white ring-2 ring-black/10 dark:ring-white/20"
                : "border-black/[0.04] dark:border-white/[0.06] hover:border-black/20"
            }`}
          >
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#686870] dark:text-[#9A9AA2] block">
              Completed
            </span>
            <span className="text-xl sm:text-2xl font-black text-[#10B981] mt-0.5 block">
              {completedCount}
            </span>
          </button>
        </div>

        {/* Overdue Warning Alert Notice (if any) */}
        {overdueCount > 0 && activeFilter !== "completed" && (
          <div className="bg-white dark:bg-[#222226] border-l-4 border-l-[#FF9500] rounded-2xl p-4 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 border border-black/[0.04] dark:border-white/[0.05]">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-[#FF9500]/15 text-[#FF9500] flex items-center justify-center shrink-0">
                <AlertCircle className="w-4 h-4" />
              </div>
              <div>
                <p className="text-sm font-bold text-[#1C1C1F] dark:text-white">
                  {overdueCount} task{overdueCount > 1 ? "s are" : " is"} overdue
                </p>
                <p className="text-xs text-[#777780] dark:text-[#9999A0]">
                  Scheduled deadlines have passed. Would you like to reschedule them to today?
                </p>
              </div>
            </div>
            <button
              onClick={onRescheduleOverdueToToday}
              className="px-4 py-1.5 rounded-xl bg-[#FF9500] hover:bg-[#E08500] text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-2xs transition-all cursor-pointer shrink-0"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reschedule All to Today</span>
            </button>
          </div>
        )}

        {/* SECTION 1: SEARCH (Pure White Card matching the color theme) */}
        <section aria-labelledby="heading-search" className="space-y-2">
          <div className="flex items-center justify-between px-1">
            <h2
              id="heading-search"
              className="text-xs font-extrabold tracking-[0.2em] text-[#2C2C30] dark:text-[#A0A0A8] uppercase"
            >
              SEARCH
            </h2>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="text-xs font-bold text-[#66666D] dark:text-[#888890] hover:text-[#1A1A1A] dark:hover:text-white uppercase tracking-wider"
              >
                Clear Search
              </button>
            )}
          </div>

          <div className="relative flex items-center">
            <input
              id="search-task-input"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Enter your search term..."
              className="w-full bg-white dark:bg-[#222226] text-[#1C1C1F] dark:text-[#F5F5F7] text-sm sm:text-base placeholder-[#9E9EA4] dark:placeholder-[#6E6E76] rounded-2xl px-5 py-3.5 sm:py-4 pr-12 shadow-xs border border-black/[0.04] dark:border-white/[0.05] focus:outline-none focus:ring-2 focus:ring-black/10 dark:focus:ring-white/20 transition-all font-normal"
            />
            <div className="absolute right-4 text-[#9E9EA4] dark:text-[#6E6E76] pointer-events-none">
              <Search className="w-5 h-5" />
            </div>
          </div>
        </section>

        {/* Responsive Category & Filter Toolbar */}
        {/* Responsive Category, Sort & Filter Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
          {/* Filter Status Pills */}
          <div className="flex flex-wrap items-center gap-1.5">
            {(
              [
                { id: "all", label: "All" },
                { id: "today", label: "Today" },
                { id: "pending", label: "Pending" },
                { id: "completed", label: "Completed" },
              ] as const
            ).map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveFilter(tab.id)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                  activeFilter === tab.id
                    ? "bg-[#1C1C1F] dark:bg-white text-white dark:text-[#1C1C1F] shadow-xs"
                    : "bg-white dark:bg-[#222226] text-[#55555B] dark:text-[#9B9BA2] hover:text-[#1C1C1F] dark:hover:text-white border border-black/[0.04] dark:border-white/[0.05]"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Right Toolbar Controls: Sort & Category */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Sort Dropdown */}
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-semibold text-[#66666D] dark:text-[#9A9AA2] flex items-center gap-1">
                <ArrowUpDown className="w-3 h-3" />
                Sort:
              </span>
              <select
                id="select-task-sort"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as "position" | "priority" | "time")}
                className="bg-white dark:bg-[#222226] text-[#1C1C1F] dark:text-white text-xs font-semibold px-3 py-1.5 rounded-xl border border-black/[0.04] dark:border-white/[0.05] shadow-2xs focus:outline-none cursor-pointer"
              >
                <option value="position">Position # (1, 2, 3...)</option>
                <option value="priority">By Priority</option>
                <option value="time">By Scheduled Time</option>
              </select>
            </div>

            {/* Category Filter Dropdown */}
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-semibold text-[#66666D] dark:text-[#9A9AA2] flex items-center gap-1">
                <Filter className="w-3 h-3" />
                Category:
              </span>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="bg-white dark:bg-[#222226] text-[#1C1C1F] dark:text-white text-xs font-semibold px-3 py-1.5 rounded-xl border border-black/[0.04] dark:border-white/[0.05] shadow-2xs focus:outline-none cursor-pointer"
              >
                <option value="all">All Categories</option>
                {settings.categories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* SECTION 2: TASK LIST (Crisp White Responsive Cards with Drag & Drop Positioning) */}
        <section aria-label="Task items list" className="space-y-3">
          {/* Subheader with placement hint */}
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-xs font-extrabold tracking-[0.2em] text-[#2C2C30] dark:text-[#A0A0A8] uppercase">
                TASKS ({filteredTasks.length})
              </h2>
              <span className="text-[11px] font-medium text-[#777780] dark:text-[#909098]">
                · Drag or tap # to reorder positions
              </span>
            </div>
            {filteredTasks.length > 0 && activeFilter !== "completed" && (
              <span className="text-[11px] font-mono font-semibold text-[#66666D] dark:text-[#9A9AA2]">
                Places 1–{filteredTasks.length}
              </span>
            )}
          </div>

          {filteredTasks.length === 0 ? (
            <div className="bg-white dark:bg-[#222226] rounded-2xl p-10 sm:p-14 text-center border border-black/[0.04] dark:border-white/[0.05] shadow-xs">
              <div className="w-12 h-12 rounded-full bg-black/[0.03] dark:bg-white/[0.05] flex items-center justify-center mx-auto mb-3">
                <Check className="w-6 h-6 text-[#8E8E93]" />
              </div>
              <h3 className="text-base font-bold text-[#1C1C1F] dark:text-[#F5F5F7]">
                {searchQuery ? "No matching tasks found" : "No tasks in this view"}
              </h3>
              <p className="text-xs sm:text-sm text-[#777780] dark:text-[#9999A0] mt-1 max-w-sm mx-auto">
                {searchQuery
                  ? "Try adjusting your search query or switching categories."
                  : "All caught up! Add a new task below to stay on schedule."}
              </p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {filteredTasks.map((task, index) => {
                const isTaskOverdue =
                  task.status !== "completed" && isOverdue(task.scheduledDate, task.scheduledTime, task.status);
                const isCompleted = task.status === "completed";
                const isBeingDragged = draggedId === task.id;
                const isDropTargetTop = dropTarget?.id === task.id && !dropTarget.placeAfter;
                const isDropTargetBottom = dropTarget?.id === task.id && dropTarget.placeAfter;
                const placeNumber = task.order ?? index + 1;
                const isExpanded = !!expandedTaskIds[task.id];

                return (
                  <div
                    key={task.id}
                    id={`task-item-${task.id}`}
                    data-task-id={task.id}
                    draggable={!isCompleted}
                    onDragStart={(e) => handleDragStart(e, task.id)}
                    onDragOver={(e) => handleDragOver(e, task.id)}
                    onDrop={(e) => handleDrop(e, task.id)}
                    onDragEnd={handleDragEnd}
                    onClick={() => toggleExpandTask(task.id)}
                    className={`group relative bg-white dark:bg-[#222226] rounded-2xl px-3 sm:px-5 py-3 sm:py-3.5 shadow-xs border flex flex-col items-stretch transition-all cursor-pointer ${
                      isBeingDragged
                        ? "opacity-30 scale-[0.98] border-dashed border-[#1C1C1F]/60 dark:border-white/60 shadow-none ring-2 ring-black/5 dark:ring-white/10"
                        : isDropTargetTop
                        ? "border-[#1C1C1F]/60 dark:border-white/60 shadow-sm ring-1 ring-[#1C1C1F]/30 dark:ring-white/30"
                        : isDropTargetBottom
                        ? "border-[#1C1C1F]/60 dark:border-white/60 shadow-sm ring-1 ring-[#1C1C1F]/30 dark:ring-white/30"
                        : isCompleted
                        ? "opacity-60 bg-white/70 dark:bg-[#222226]/70 border-black/[0.04] dark:border-white/[0.05]"
                        : "border-black/[0.04] dark:border-white/[0.05] hover:shadow-sm hover:border-black/10 dark:hover:border-white/10"
                    }`}
                  >
                    {/* Top Drop Indicator Bar (Non-shifting overlay) */}
                    {isDropTargetTop && (
                      <div className="absolute -top-1 inset-x-3 h-1 bg-[#1C1C1F] dark:bg-white rounded-full shadow-[0_0_8px_rgba(0,0,0,0.35)] dark:shadow-[0_0_8px_rgba(255,255,255,0.7)] z-30 pointer-events-none flex items-center justify-center animate-pulse">
                        <span className="absolute -top-3.5 px-2 py-0.5 rounded-full text-[9px] font-mono font-bold bg-[#1C1C1F] dark:bg-white text-white dark:text-[#1C1C1F] shadow-sm">
                          Place #{placeNumber}
                        </span>
                      </div>
                    )}

                    {/* Bottom Drop Indicator Bar (Non-shifting overlay) */}
                    {isDropTargetBottom && (
                      <div className="absolute -bottom-1 inset-x-3 h-1 bg-[#1C1C1F] dark:bg-white rounded-full shadow-[0_0_8px_rgba(0,0,0,0.35)] dark:shadow-[0_0_8px_rgba(255,255,255,0.7)] z-30 pointer-events-none flex items-center justify-center animate-pulse">
                        <span className="absolute -bottom-3.5 px-2 py-0.5 rounded-full text-[9px] font-mono font-bold bg-[#1C1C1F] dark:bg-white text-white dark:text-[#1C1C1F] shadow-sm">
                          Place #{placeNumber + 1}
                        </span>
                      </div>
                    )}

                    {/* MAIN TASK ROW */}
                    <div className="flex items-center justify-between gap-2.5 sm:gap-4 w-full">
                      {/* Left: Drag Handle + Place Number Badge + Circular Checkbox + Task Content */}
                      <div className="flex items-start sm:items-center gap-2.5 sm:gap-3.5 min-w-0 flex-1">
                        
                        {/* Drag Handle & Position Badge (Place 1, 2, 3, 4...) */}
                        {!isCompleted && (
                          <div className="flex items-center gap-1 sm:gap-1.5 shrink-0 select-none">
                            {/* Drag Grip Handle with touch and pointer support */}
                            <div
                              title="Drag to change position (1, 2, 3...)"
                              onPointerDown={(e) => {
                                e.stopPropagation();
                                handlePointerDown(e, task.id);
                              }}
                              onPointerMove={(e) => handlePointerMove(e, task.id)}
                              onPointerUp={handlePointerUp}
                              onPointerCancel={handlePointerUp}
                              className="p-1 rounded-lg text-[#8E8E93] hover:text-[#1C1C1F] dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/10 cursor-grab active:cursor-grabbing transition-colors touch-none"
                            >
                              <GripVertical className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
                            </div>

                            {/* Position Place Number Pill / Badge (e.g. #1, #2, #3, #4) */}
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setPositionModalTask(task);
                                setCustomPositionInput(String(placeNumber));
                              }}
                              title={`Position Place #${placeNumber} · Tap to choose position 1, 2, 3, 4...`}
                              className="min-w-[28px] h-6 sm:min-w-[32px] sm:h-7 px-1.5 rounded-lg sm:rounded-xl bg-black/[0.04] dark:bg-white/[0.06] hover:bg-black/[0.09] dark:hover:bg-white/[0.14] border border-black/[0.06] dark:border-white/[0.08] flex items-center justify-center font-mono font-bold text-[11px] sm:text-xs text-[#1C1C1F] dark:text-[#F3F3F5] transition-all cursor-pointer shadow-2xs group-hover:border-black/20 dark:group-hover:border-white/20 active:scale-95"
                            >
                              <span className="text-[10px] text-[#8E8E93] dark:text-[#888890] mr-0.5 font-normal">#</span>
                              <span>{placeNumber}</span>
                            </button>
                          </div>
                        )}

                        {/* Minimal Circular Checkbox - Marks Task Completed */}
                        <button
                          type="button"
                          id={`btn-complete-${task.id}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            onToggleComplete(task.id);
                          }}
                          aria-label={isCompleted ? "Mark task as incomplete" : "Mark task as completed"}
                          title={isCompleted ? "Completed - click to mark incomplete" : "Click circle to mark completed"}
                          className={`group/circle w-5.5 h-5.5 sm:w-6 sm:h-6 rounded-full border-2 transition-all flex items-center justify-center shrink-0 mt-0.5 sm:mt-0 cursor-pointer ${
                            isCompleted
                              ? "bg-[#1C1C1F] dark:bg-white border-[#1C1C1F] dark:border-white text-white dark:text-[#1C1C1F] shadow-2xs"
                              : "border-black/35 dark:border-white/40 hover:border-black dark:hover:border-white hover:bg-black/5 dark:hover:bg-white/10 active:scale-95"
                          }`}
                        >
                          {isCompleted ? (
                            <Check className="w-3.5 h-3.5 stroke-[3]" />
                          ) : (
                            <Check className="w-3.5 h-3.5 stroke-[2.5] text-black/40 dark:text-white/40 opacity-0 group-hover/circle:opacity-100 transition-opacity" />
                          )}
                        </button>

                        {/* Title and metadata - Clicking EXPANDS the notepad */}
                        <div
                          title={isExpanded ? "Click to collapse notepad" : "Click to expand notepad & notes"}
                          className="min-w-0 flex-1 select-none"
                        >
                          <div className="flex flex-wrap items-center gap-2">
                            <span
                              className={`text-sm sm:text-base leading-snug font-medium block break-words ${
                                isCompleted
                                  ? "line-through text-[#8E8E93] dark:text-[#7A7A82]"
                                  : "text-[#1C1C1F] dark:text-[#F3F3F5]"
                              }`}
                            >
                              {task.title}
                            </span>

                            {/* Attached notes badge */}
                            {(task.notes || task.description) && (
                              <span
                                title="Has notes (tap to view notepad)"
                                className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-300/30 dark:border-amber-700/30 uppercase tracking-wider"
                              >
                                <StickyNote className="w-3 h-3 text-[#FF9500]" />
                                Notes
                              </span>
                            )}

                            {/* Priority indicator if urgent or high */}
                            {task.priority === "urgent" && (
                              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-[#FF3B30]/10 text-[#FF3B30]">
                                Urgent
                              </span>
                            )}
                            {task.priority === "high" && (
                              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-[#FF9500]/10 text-[#FF9500]">
                                High
                              </span>
                            )}
                          </div>

                          {/* Preview snippet if collapsed and has notes */}
                          {!isExpanded && (task.notes || task.description) && (
                            <p className="text-xs text-[#777780] dark:text-[#9A9AA2] mt-0.5 line-clamp-1 italic">
                              &ldquo;{task.notes || task.description}&rdquo;
                            </p>
                          )}

                          {/* Metadata row: Category, Time, Alarm, Overdue badge */}
                          <div className="flex flex-wrap items-center gap-2 text-xs text-[#777780] dark:text-[#9999A2] mt-1">
                            <span className="font-semibold text-[#44444A] dark:text-[#B0B0B8]">
                              {task.category}
                            </span>

                            {task.scheduledDate && (
                              <>
                                <span>·</span>
                                <span>{task.scheduledDate === getTodayString() ? "Today" : task.scheduledDate}</span>
                              </>
                            )}

                            {task.scheduledTime && (
                              <>
                                <span>·</span>
                                <span>{formatTimeDisplay(task.scheduledTime)}</span>
                              </>
                            )}

                            {task.reminderEnabled && (
                              <span title="Audio alarm chime active" className="text-[#FF9500] flex items-center gap-0.5 font-medium">
                                <Bell className="w-3 h-3 fill-current" />
                                <span className="text-[10px]">Chime</span>
                              </span>
                            )}

                            {isTaskOverdue && (
                              <>
                                <span>·</span>
                                <span className="text-[#FF9500] font-bold">Overdue</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Right Actions: Quick Shift Up/Down + Expand Chevron + Edit & Trash */}
                      <div className="flex items-center gap-1 shrink-0">
                        {/* Quick Up/Down Shift Arrows (Accessible Reordering) */}
                        {!isCompleted && (
                          <div className="flex flex-col gap-0.5 mr-0.5 sm:mr-1">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                onMoveTaskDelta(task.id, -1);
                                if (sortBy !== "position") setSortBy("position");
                              }}
                              disabled={index === 0}
                              title="Move up 1 place"
                              className="w-5 h-5 rounded-md flex items-center justify-center text-[#8E8E93] hover:text-[#1C1C1F] dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/10 disabled:opacity-20 disabled:pointer-events-none transition-colors cursor-pointer"
                            >
                              <ArrowUp className="w-3 h-3 stroke-[2.5]" />
                            </button>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                onMoveTaskDelta(task.id, 1);
                                if (sortBy !== "position") setSortBy("position");
                              }}
                              disabled={index === filteredTasks.length - 1}
                              title="Move down 1 place"
                              className="w-5 h-5 rounded-md flex items-center justify-center text-[#8E8E93] hover:text-[#1C1C1F] dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/10 disabled:opacity-20 disabled:pointer-events-none transition-colors cursor-pointer"
                            >
                              <ArrowDown className="w-3 h-3 stroke-[2.5]" />
                            </button>
                          </div>
                        )}

                        {/* Expand / Collapse Notepad Toggle Button */}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleExpandTask(task.id);
                          }}
                          title={isExpanded ? "Collapse task notepad" : "Open task notepad"}
                          className="w-8 h-8 rounded-xl flex items-center justify-center text-[#8E8E93] hover:text-[#1C1C1F] dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/10 transition-colors cursor-pointer"
                        >
                          {isExpanded ? (
                            <ChevronUp className="w-4 h-4 text-[#1C1C1F] dark:text-white stroke-[2.5]" />
                          ) : (
                            <ChevronDown className="w-4 h-4 stroke-[2]" />
                          )}
                        </button>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onEditTask(task);
                          }}
                          title="Edit task details"
                          className="w-8 h-8 rounded-xl flex items-center justify-center text-[#8E8E93] hover:text-[#1C1C1F] dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/10 transition-colors opacity-80 sm:opacity-0 sm:group-hover:opacity-100 focus:opacity-100 cursor-pointer"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onDeleteTask(task.id);
                          }}
                          title="Delete task"
                          className="w-8 h-8 rounded-xl flex items-center justify-center text-[#2C2C30] dark:text-[#D0D0D5] hover:text-[#FF3B30] dark:hover:text-[#FF453A] hover:bg-[#FF3B30]/10 transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4 stroke-[1.75]" />
                        </button>
                      </div>
                    </div>

                    {/* EXPANDABLE NOTEPAD SECTION */}
                    {isExpanded && (
                      <div
                        onClick={(e) => e.stopPropagation()}
                        className="w-full pt-3.5 mt-3 border-t border-black/[0.06] dark:border-white/[0.08] animate-fadeIn cursor-default"
                      >
                        <TaskNotepad
                          task={task}
                          onUpdate={(updates) => onUpdateTask(task.id, updates)}
                          onToggleComplete={() => onToggleComplete(task.id)}
                          onClose={() => toggleExpandTask(task.id)}
                        />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* SECTION 3: ADD NEW (Pure White Card matching the color theme) */}
        <section aria-labelledby="heading-add-new" className="space-y-2 pt-2">
          <div className="flex items-center justify-between px-1">
            <h2
              id="heading-add-new"
              className="text-xs font-extrabold tracking-[0.2em] text-[#2C2C30] dark:text-[#A0A0A8] uppercase"
            >
              ADD NEW
            </h2>
            <button
              type="button"
              onClick={() => setShowAdvancedAdd(!showAdvancedAdd)}
              title="Toggle scheduling options"
              className="text-xs font-bold text-[#55555B] dark:text-[#9B9BA2] hover:text-[#1C1C1F] dark:hover:text-white flex items-center gap-1 cursor-pointer"
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>{showAdvancedAdd ? "Simple Add" : "Schedule & Alarm"}</span>
            </button>
          </div>

          <form onSubmit={handleCreateTask} className="space-y-3">
            <div className="relative flex items-center">
              <input
                id="input-add-todo"
                ref={inputRef}
                type="text"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="Add new todo..."
                className="w-full bg-white dark:bg-[#222226] text-[#1C1C1F] dark:text-[#F5F5F7] text-sm sm:text-base placeholder-[#9E9EA4] dark:placeholder-[#6E6E76] rounded-2xl px-5 py-3.5 sm:py-4 pr-14 shadow-xs border border-black/[0.04] dark:border-white/[0.05] focus:outline-none focus:ring-2 focus:ring-black/10 dark:focus:ring-white/20 transition-all font-normal"
              />
              <button
                type="submit"
                disabled={!newTitle.trim()}
                className="absolute right-3 w-8 h-8 rounded-xl bg-[#1C1C1F] dark:bg-white text-white dark:text-[#1C1C1F] disabled:opacity-20 flex items-center justify-center transition-all cursor-pointer disabled:cursor-not-allowed hover:scale-105 active:scale-95 shadow-xs"
                title="Add task (or press Enter)"
              >
                <Plus className="w-4 h-4 stroke-[2.5]" />
              </button>
            </div>

            {/* Expandable Scheduling / Alarm / Priority Options */}
            {showAdvancedAdd && (
              <div className="bg-white dark:bg-[#222226] rounded-2xl p-4 border border-black/[0.04] dark:border-white/[0.05] shadow-xs flex flex-wrap items-center gap-3 text-xs">
                {/* Date Picker */}
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-black/[0.04] dark:bg-white/[0.06]">
                  <Calendar className="w-3.5 h-3.5 text-[#777780]" />
                  <select
                    value={
                      newDate === getTodayString() ? "today" : newDate === getTomorrowString() ? "tomorrow" : "custom"
                    }
                    onChange={(e) => {
                      if (e.target.value === "today") setNewDate(getTodayString());
                      else if (e.target.value === "tomorrow") setNewDate(getTomorrowString());
                      else {
                        const picked = prompt("Enter date YYYY-MM-DD:", getTodayString());
                        if (picked) setNewDate(picked);
                      }
                    }}
                    className="bg-transparent text-xs font-medium focus:outline-none cursor-pointer"
                  >
                    <option value="today">Today</option>
                    <option value="tomorrow">Tomorrow</option>
                    <option value="custom">Custom Date</option>
                  </select>
                </div>

                {/* Time + Alarm Chime */}
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-black/[0.04] dark:bg-white/[0.06]">
                  <Clock className="w-3.5 h-3.5 text-[#777780]" />
                  <input
                    type="time"
                    value={newTime}
                    onChange={(e) => {
                      setNewTime(e.target.value);
                      if (e.target.value) setNewAlarmEnabled(true);
                    }}
                    className="bg-transparent text-xs font-medium focus:outline-none cursor-pointer"
                    title="Set time for audio alarm chime"
                  />
                  {newTime && (
                    <button
                      type="button"
                      onClick={() => setNewAlarmEnabled(!newAlarmEnabled)}
                      title={newAlarmEnabled ? "Alarm chime active" : "Alarm chime muted"}
                      className={`ml-1 flex items-center gap-1 text-[11px] font-semibold cursor-pointer ${
                        newAlarmEnabled ? "text-[#FF9500]" : "text-[#8E8E93]"
                      }`}
                    >
                      <Bell className="w-3.5 h-3.5 fill-current" />
                      <span>{newAlarmEnabled ? "Alarm On" : "Muted"}</span>
                    </button>
                  )}
                </div>

                {/* Priority */}
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-black/[0.04] dark:bg-white/[0.06]">
                  <span className="text-[#777780] font-medium">Priority:</span>
                  <select
                    value={newPriority}
                    onChange={(e) => setNewPriority(e.target.value as Priority)}
                    className="bg-transparent text-xs font-semibold focus:outline-none cursor-pointer capitalize"
                  >
                    <option value="urgent">Urgent</option>
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </select>
                </div>

                {/* Category */}
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-black/[0.04] dark:bg-white/[0.06]">
                  <span className="text-[#777780] font-medium">Category:</span>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="bg-transparent text-xs font-semibold focus:outline-none cursor-pointer"
                  >
                    {settings.categories.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}
          </form>
        </section>

      </div>

      {/* Luxury Apple Position Picker Modal (Direct 1, 2, 3, 4... Placement) */}
      {positionModalTask && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fadeIn"
          onClick={() => setPositionModalTask(null)}
        >
          <div
            className="bg-white dark:bg-[#1E1E22] text-[#1C1C1F] dark:text-[#F3F3F5] rounded-3xl p-6 sm:p-7 shadow-2xl border border-black/10 dark:border-white/10 max-w-sm w-full space-y-5 animate-scaleUp"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-start justify-between gap-3">
              <div>
                <span className="text-[11px] font-extrabold uppercase tracking-widest text-[#8E8E93] dark:text-[#888890]">
                  Set Task Position
                </span>
                <h3 className="text-base font-bold text-[#1C1C1F] dark:text-[#F3F3F5] mt-0.5 line-clamp-1">
                  {positionModalTask.title}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setPositionModalTask(null)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-[#8E8E93] hover:text-[#1C1C1F] dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/10 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Current Position Display */}
            <div className="flex items-center justify-between p-3.5 rounded-2xl bg-black/[0.03] dark:bg-white/[0.05] border border-black/[0.04] dark:border-white/[0.06]">
              <span className="text-xs font-semibold text-[#66666D] dark:text-[#9A9AA2]">
                Current Position:
              </span>
              <span className="font-mono font-bold text-sm text-[#1C1C1F] dark:text-white bg-black/[0.06] dark:bg-white/[0.1] px-3 py-1 rounded-xl shadow-2xs">
                Place #{positionModalTask.order ?? 1}
              </span>
            </div>

            {/* Quick 1-Tap Place Grid (1, 2, 3, 4, ...) */}
            <div>
              <p className="text-xs font-bold text-[#44444A] dark:text-[#B0B0B8] mb-2.5 uppercase tracking-wider">
                Select Place Number:
              </p>
              <div className="grid grid-cols-4 sm:grid-cols-5 gap-2 max-h-48 overflow-y-auto pr-1">
                {Array.from({ length: tasks.length }, (_, i) => i + 1).map((placeNum) => {
                  const isCurrent = (positionModalTask.order ?? 1) === placeNum;
                  return (
                    <button
                      key={placeNum}
                      type="button"
                      onClick={() => {
                        onMoveTaskToPosition(positionModalTask.id, placeNum);
                        if (sortBy !== "position") setSortBy("position");
                        setPositionModalTask(null);
                      }}
                      className={`h-10 rounded-xl font-mono font-bold text-sm flex items-center justify-center transition-all cursor-pointer ${
                        isCurrent
                          ? "bg-[#1C1C1F] dark:bg-white text-white dark:text-[#1C1C1F] shadow-sm ring-2 ring-black/20 dark:ring-white/30 scale-105"
                          : "bg-black/[0.04] dark:bg-white/[0.06] hover:bg-black/[0.09] dark:hover:bg-white/[0.12] text-[#1C1C1F] dark:text-white border border-black/[0.04] dark:border-white/[0.06]"
                      }`}
                    >
                      {placeNum}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Custom Input for jumping to any number */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const targetNum = parseInt(customPositionInput, 10);
                if (!isNaN(targetNum) && targetNum >= 1) {
                  onMoveTaskToPosition(positionModalTask.id, targetNum);
                  if (sortBy !== "position") setSortBy("position");
                  setPositionModalTask(null);
                }
              }}
              className="flex items-center gap-2 pt-1"
            >
              <div className="relative flex-1">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 font-mono text-xs text-[#8E8E93]">#</span>
                <input
                  type="number"
                  min="1"
                  max={tasks.length}
                  value={customPositionInput}
                  onChange={(e) => setCustomPositionInput(e.target.value)}
                  placeholder="Enter place..."
                  className="w-full pl-7 pr-3 py-2 rounded-xl text-xs font-mono font-bold bg-black/[0.04] dark:bg-white/[0.06] border border-black/[0.06] dark:border-white/[0.08] focus:outline-none focus:ring-2 focus:ring-black/10 dark:focus:ring-white/20"
                />
              </div>
              <button
                type="submit"
                className="px-4 py-2 text-xs font-bold bg-black/[0.08] dark:bg-white/[0.1] hover:bg-black/[0.14] dark:hover:bg-white/[0.18] rounded-xl transition-all cursor-pointer"
              >
                Go
              </button>
            </form>

            {/* Quick Top & Bottom Shortcuts */}
            <div className="grid grid-cols-2 gap-2 pt-1 border-t border-black/[0.06] dark:border-white/[0.08]">
              <button
                type="button"
                onClick={() => {
                  onMoveTaskToPosition(positionModalTask.id, 1);
                  if (sortBy !== "position") setSortBy("position");
                  setPositionModalTask(null);
                }}
                className="px-3 py-2 rounded-xl text-xs font-bold bg-black/[0.04] dark:bg-white/[0.06] hover:bg-black/[0.08] dark:hover:bg-white/[0.1] text-[#1C1C1F] dark:text-white transition-colors cursor-pointer"
              >
                Top (#1)
              </button>
              <button
                type="button"
                onClick={() => {
                  onMoveTaskToPosition(positionModalTask.id, tasks.length);
                  if (sortBy !== "position") setSortBy("position");
                  setPositionModalTask(null);
                }}
                className="px-3 py-2 rounded-xl text-xs font-bold bg-black/[0.04] dark:bg-white/[0.06] hover:bg-black/[0.08] dark:hover:bg-white/[0.1] text-[#1C1C1F] dark:text-white transition-colors cursor-pointer"
              >
                Bottom (#{tasks.length})
              </button>
            </div>

            {/* Done button */}
            <div className="flex items-center justify-end pt-1">
              <button
                type="button"
                onClick={() => setPositionModalTask(null)}
                className="px-5 py-2 text-xs font-bold bg-[#1C1C1F] dark:bg-white text-white dark:text-[#1C1C1F] rounded-xl hover:opacity-90 transition-all cursor-pointer shadow-xs"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
};
