import React, { useState, useEffect } from "react";
import { Task, Priority, TaskStatus, ReminderOffset } from "../types/task";
import {
  getTodayString,
  getTomorrowString,
  formatTimeDisplay,
} from "../utils/dateUtils";
import { parseNaturalLanguageTask } from "../utils/naturalLanguageParser";
import {
  X,
  Calendar,
  Clock,
  Bell,
  Tag,
  AlignLeft,
  Sparkles,
  Trash2,
  Check,
} from "lucide-react";

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (taskData: Omit<Task, "id" | "createdAt" | "updatedAt">) => void;
  onUpdate?: (id: string, updates: Partial<Task>) => void;
  onDelete?: (id: string) => void;
  initialTask?: Task | null;
  categories: string[];
  defaultReminderOffset: ReminderOffset;
}

export const TaskModal: React.FC<TaskModalProps> = ({
  isOpen,
  onClose,
  onSave,
  onUpdate,
  onDelete,
  initialTask,
  categories,
  defaultReminderOffset,
}) => {
  const isEditing = !!initialTask;

  // Form states
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState(categories[0] || "General");
  const [priority, setPriority] = useState<Priority>("medium");
  const [status, setStatus] = useState<TaskStatus>("pending");
  const [scheduledDate, setScheduledDate] = useState<string>("");
  const [scheduledTime, setScheduledTime] = useState<string>("");
  const [reminderEnabled, setReminderEnabled] = useState(false);
  const [reminderTime, setReminderTime] = useState<ReminderOffset>(defaultReminderOffset);
  const [tagsInput, setTagsInput] = useState("");
  const [tags, setTags] = useState<string[]>([]);

  // Natural language entry toggle / live hint
  const [nlInput, setNlInput] = useState("");
  const [showNlInterpretation, setShowNlInterpretation] = useState(false);
  const [parsedNl, setParsedNl] = useState<ReturnType<typeof parseNaturalLanguageTask> | null>(null);

  useEffect(() => {
    if (initialTask) {
      setTitle(initialTask.title);
      setDescription(initialTask.description || "");
      setCategory(initialTask.category);
      setPriority(initialTask.priority);
      setStatus(initialTask.status);
      setScheduledDate(initialTask.scheduledDate || "");
      setScheduledTime(initialTask.scheduledTime || "");
      setReminderEnabled(initialTask.reminderEnabled);
      setReminderTime(initialTask.reminderTime || defaultReminderOffset);
      setTags(initialTask.tags || []);
      setTagsInput("");
      setNlInput("");
      setShowNlInterpretation(false);
    } else {
      setTitle("");
      setDescription("");
      setCategory(categories[0] || "General");
      setPriority("medium");
      setStatus("pending");
      setScheduledDate(getTodayString());
      setScheduledTime("");
      setReminderEnabled(false);
      setReminderTime(defaultReminderOffset);
      setTags([]);
      setTagsInput("");
      setNlInput("");
      setShowNlInterpretation(false);
    }
  }, [initialTask, categories, defaultReminderOffset, isOpen]);

  if (!isOpen) return null;

  // Natural Language Input handler
  const handleNlChange = (val: string) => {
    setNlInput(val);
    if (!val.trim()) {
      setShowNlInterpretation(false);
      setParsedNl(null);
      return;
    }
    const parsed = parseNaturalLanguageTask(val, categories);
    setParsedNl(parsed);
    setShowNlInterpretation(true);
  };

  const applyNaturalLanguageParse = () => {
    if (!parsedNl) return;
    if (parsedNl.title) setTitle(parsedNl.title);
    if (parsedNl.scheduledDate) setScheduledDate(parsedNl.scheduledDate);
    if (parsedNl.scheduledTime) {
      setScheduledTime(parsedNl.scheduledTime);
      setReminderEnabled(true);
    }
    if (parsedNl.priority) setPriority(parsedNl.priority);
    if (parsedNl.category) setCategory(parsedNl.category);
    setShowNlInterpretation(false);
    setNlInput("");
  };

  const handleAddTag = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      const cleaned = tagsInput.trim().replace(/^#/, "");
      if (cleaned && !tags.includes(cleaned)) {
        setTags([...tags, cleaned]);
      }
      setTagsInput("");
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((t) => t !== tagToRemove));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const payload = {
      title: title.trim(),
      description: description.trim() || undefined,
      category: category || "General",
      priority,
      status,
      scheduledDate: scheduledDate || undefined,
      scheduledTime: scheduledTime || undefined,
      reminderEnabled,
      reminderTime: reminderEnabled ? reminderTime : undefined,
      tags: tags.length > 0 ? tags : undefined,
    };

    if (isEditing && initialTask && onUpdate) {
      onUpdate(initialTask.id, payload);
    } else {
      onSave(payload);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/40 dark:bg-black/60 backdrop-blur-xl overflow-y-auto">
      <div
        id="task-modal"
        className="w-full max-w-lg bg-white/95 dark:bg-[#1C1C1E]/95 backdrop-blur-2xl rounded-3xl border border-black/[0.08] dark:border-white/[0.1] shadow-[0_24px_60px_rgba(0,0,0,0.15)] dark:shadow-[0_24px_60px_rgba(0,0,0,0.6)] overflow-hidden transition-all my-8"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-black/[0.05] dark:border-white/[0.08]">
          <div className="flex items-center gap-2.5">
            <span className="w-2 h-2 rounded-full bg-[#1C1C1F] dark:bg-white inline-block shadow-xs" />
            <h2 className="text-[17px] font-semibold tracking-tight text-[#1D1D1F] dark:text-[#F5F5F7]">
              {isEditing ? "Edit Task" : "New Task"}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full flex items-center justify-center text-[#86868B] hover:text-[#1D1D1F] dark:hover:text-white hover:bg-black/[0.05] dark:hover:bg-white/[0.1] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          {/* Smart Natural Language Entry (for new tasks) */}
          {!isEditing && (
            <div className="p-3.5 bg-black/[0.02] dark:bg-white/[0.04] rounded-2xl border border-black/[0.04] dark:border-white/[0.06] space-y-2">
              <div className="flex items-center justify-between text-[11px] font-medium text-[#86868B] dark:text-[#98989D]">
                <span className="flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-[#0071E3]" />
                  Natural Language Quick Fill
                </span>
                <span className="text-[10px] text-[#86868B]">e.g. &ldquo;Board review tomorrow 3pm urgent&rdquo;</span>
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={nlInput}
                  onChange={(e) => handleNlChange(e.target.value)}
                  placeholder="Type with date, time, and priority..."
                  className="flex-1 px-3 py-1.5 text-xs bg-white dark:bg-[#2C2C2E] border border-black/[0.06] dark:border-white/[0.08] rounded-xl text-[#1D1D1F] dark:text-white placeholder-[#86868B] focus:outline-none focus:ring-2 focus:ring-[#0071E3]/20"
                />
              </div>

              {/* Live Interpretation Preview */}
              {showNlInterpretation && parsedNl && (
                <div className="p-3 bg-white dark:bg-[#2C2C2E] rounded-xl border border-black/[0.06] dark:border-white/[0.08] text-xs space-y-2">
                  <div className="text-[10px] font-semibold text-[#86868B] uppercase tracking-wider">
                    Detected values:
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-[11px]">
                    <div>
                      <span className="text-[#86868B]">Task:</span>{" "}
                      <span className="font-semibold text-[#1D1D1F] dark:text-white">
                        {parsedNl.title}
                      </span>
                    </div>
                    {parsedNl.rawMatched.dateText && (
                      <div>
                        <span className="text-[#86868B]">Date:</span>{" "}
                        <span className="font-semibold text-[#1D1D1F] dark:text-white">
                          {parsedNl.rawMatched.dateText}
                        </span>
                      </div>
                    )}
                    {parsedNl.scheduledTime && (
                      <div>
                        <span className="text-[#86868B]">Time:</span>{" "}
                        <span className="font-semibold text-[#1D1D1F] dark:text-white">
                          {formatTimeDisplay(parsedNl.scheduledTime)}
                        </span>
                      </div>
                    )}
                    {parsedNl.priority && (
                      <div>
                        <span className="text-[#86868B]">Priority:</span>{" "}
                        <span className="font-semibold capitalize text-[#1D1D1F] dark:text-white">
                          {parsedNl.priority}
                        </span>
                      </div>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={applyNaturalLanguageParse}
                    className="w-full mt-1 py-1.5 text-xs font-semibold bg-[#0071E3] hover:bg-[#0077ED] text-white rounded-full transition-all cursor-pointer"
                  >
                    Apply to Form
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Task Name (Mandatory) */}
          <div>
            <label className="block text-xs font-medium text-[#1D1D1F] dark:text-[#F5F5F7] mb-1.5">
              Task Title <span className="text-[#FF3B30]">*</span>
            </label>
            <input
              id="input-task-title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Subam Audios Website Backend Development"
              className="w-full px-3.5 py-2.5 text-sm bg-black/[0.03] dark:bg-white/[0.06] border border-black/[0.04] dark:border-white/[0.06] rounded-xl text-[#1D1D1F] dark:text-white placeholder-[#86868B] focus:outline-none focus:ring-2 focus:ring-[#0071E3]/25"
              required
              autoFocus
            />
          </div>

          {/* Category & Priority Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {/* Category */}
            <div>
              <label className="block text-xs font-medium text-[#1D1D1F] dark:text-[#F5F5F7] mb-1.5">
                Category
              </label>
              <select
                id="select-task-category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-black/[0.03] dark:bg-white/[0.06] border border-black/[0.04] dark:border-white/[0.06] rounded-xl text-[#1D1D1F] dark:text-white focus:outline-none cursor-pointer"
              >
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            {/* Priority Selector (Apple Segmented Style) */}
            <div>
              <label className="block text-xs font-medium text-[#1D1D1F] dark:text-[#F5F5F7] mb-1.5">
                Priority
              </label>
              <div className="grid grid-cols-4 gap-1 p-0.5 rounded-xl bg-black/[0.04] dark:bg-white/[0.06] border border-black/[0.03] dark:border-white/[0.04]">
                {(["urgent", "high", "medium", "low"] as Priority[]).map((p) => {
                  const isSelected = priority === p;
                  return (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setPriority(p)}
                      className={`py-1 rounded-lg text-xs transition-all flex items-center justify-center capitalize cursor-pointer ${
                        isSelected
                          ? "bg-white dark:bg-[#2C2C2E] text-[#1D1D1F] dark:text-white shadow-xs font-semibold"
                          : "text-[#86868B] hover:text-[#1D1D1F] dark:hover:text-white"
                      }`}
                    >
                      {p}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Status (Apple Segmented Control) */}
          <div>
            <label className="block text-xs font-medium text-[#1D1D1F] dark:text-[#F5F5F7] mb-1.5">
              Status
            </label>
            <div className="grid grid-cols-4 gap-1 p-0.5 rounded-xl bg-black/[0.04] dark:bg-white/[0.06] border border-black/[0.03] dark:border-white/[0.04]">
              {(
                [
                  { id: "pending", label: "Pending" },
                  { id: "in_progress", label: "In Progress" },
                  { id: "waiting", label: "Waiting" },
                  { id: "completed", label: "Done" },
                ] as { id: TaskStatus; label: string }[]
              ).map((st) => {
                const isSelected = status === st.id;
                return (
                  <button
                    key={st.id}
                    type="button"
                    onClick={() => setStatus(st.id)}
                    className={`py-1.5 rounded-lg text-xs transition-all text-center cursor-pointer ${
                      isSelected
                        ? "bg-white dark:bg-[#2C2C2E] text-[#1D1D1F] dark:text-white shadow-xs font-semibold"
                        : "text-[#86868B] hover:text-[#1D1D1F] dark:hover:text-white"
                    }`}
                  >
                    {st.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Date & Time Scheduling */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 bg-black/[0.02] dark:bg-white/[0.04] rounded-2xl border border-black/[0.04] dark:border-white/[0.06]">
            {/* Date */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-medium text-[#1D1D1F] dark:text-[#F5F5F7] flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-[#86868B]" />
                  Scheduled Date
                </label>
                <div className="flex items-center gap-1.5 text-[11px]">
                  <button
                    type="button"
                    onClick={() => setScheduledDate(getTodayString())}
                    className="text-[#0071E3] dark:text-[#0A84FF] hover:underline cursor-pointer"
                  >
                    Today
                  </button>
                  <span className="text-[#86868B]">·</span>
                  <button
                    type="button"
                    onClick={() => setScheduledDate(getTomorrowString())}
                    className="text-[#0071E3] dark:text-[#0A84FF] hover:underline cursor-pointer"
                  >
                    Tomorrow
                  </button>
                </div>
              </div>
              <input
                id="input-scheduled-date"
                type="date"
                value={scheduledDate}
                onChange={(e) => setScheduledDate(e.target.value)}
                className="w-full px-3 py-1.5 text-xs bg-white dark:bg-[#2C2C2E] border border-black/[0.06] dark:border-white/[0.08] rounded-xl text-[#1D1D1F] dark:text-white focus:outline-none cursor-pointer"
              />
            </div>

            {/* Time */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-medium text-[#1D1D1F] dark:text-[#F5F5F7] flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-[#86868B]" />
                  Scheduled Time
                </label>
                {scheduledTime && (
                  <button
                    type="button"
                    onClick={() => setScheduledTime("")}
                    className="text-[11px] text-[#FF3B30] hover:underline cursor-pointer"
                  >
                    Clear time
                  </button>
                )}
              </div>
              <input
                id="input-scheduled-time"
                type="time"
                value={scheduledTime}
                onChange={(e) => setScheduledTime(e.target.value)}
                className="w-full px-3 py-1.5 text-xs bg-white dark:bg-[#2C2C2E] border border-black/[0.06] dark:border-white/[0.08] rounded-xl text-[#1D1D1F] dark:text-white focus:outline-none cursor-pointer"
              />
            </div>
          </div>

          {/* Apple Audible Reminder Switch */}
          <div className="flex items-center justify-between p-3.5 bg-black/[0.02] dark:bg-white/[0.04] rounded-2xl border border-black/[0.04] dark:border-white/[0.06]">
            <div className="flex items-center gap-3">
              <span className="w-8 h-8 rounded-full bg-[#FF9500]/15 text-[#FF9500] flex items-center justify-center shrink-0">
                <Bell className="w-4 h-4 fill-current" />
              </span>
              <div>
                <span className="text-xs font-medium text-[#1D1D1F] dark:text-[#F5F5F7] block">
                  Alarm Chime & Notification
                </span>
                <span className="text-[11px] text-[#86868B]">
                  Triggers audible chime & desktop alarm
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              {reminderEnabled && (
                <select
                  value={reminderTime}
                  onChange={(e) => setReminderTime(e.target.value as ReminderOffset)}
                  className="px-2.5 py-1 text-xs bg-white dark:bg-[#2C2C2E] border border-black/[0.06] dark:border-white/[0.08] rounded-xl text-[#1D1D1F] dark:text-white focus:outline-none cursor-pointer"
                >
                  <option value="at_time">At scheduled time</option>
                  <option value="5m">5 min before</option>
                  <option value="10m">10 min before</option>
                  <option value="15m">15 min before</option>
                  <option value="30m">30 min before</option>
                  <option value="1h">1 hour before</option>
                </select>
              )}

              {/* Apple iOS Switch Toggle */}
              <button
                type="button"
                id="btn-toggle-reminder"
                onClick={() => setReminderEnabled(!reminderEnabled)}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full transition-colors duration-200 ease-in-out p-0.5 ${
                  reminderEnabled ? "bg-[#34C759]" : "bg-black/20 dark:bg-white/20"
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md transition duration-200 ease-in-out ${
                    reminderEnabled ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Description / Notes */}
          <div>
            <label className="block text-xs font-medium text-[#1D1D1F] dark:text-[#F5F5F7] mb-1.5 flex items-center gap-1.5">
              <AlignLeft className="w-3.5 h-3.5 text-[#86868B]" />
              Notes (Optional)
            </label>
            <textarea
              id="input-task-notes"
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add links, context, or notes..."
              className="w-full px-3.5 py-2 text-xs bg-black/[0.03] dark:bg-white/[0.06] border border-black/[0.04] dark:border-white/[0.06] rounded-xl text-[#1D1D1F] dark:text-white placeholder-[#86868B] focus:outline-none focus:ring-2 focus:ring-[#0071E3]/25 resize-none"
            />
          </div>

          {/* Tags */}
          <div>
            <label className="block text-xs font-medium text-[#1D1D1F] dark:text-[#F5F5F7] mb-1.5 flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5 text-[#86868B]" />
              Tags
            </label>
            <div className="flex flex-wrap items-center gap-1.5 p-2 bg-black/[0.03] dark:bg-white/[0.06] border border-black/[0.04] dark:border-white/[0.06] rounded-xl">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-white dark:bg-[#2C2C2E] text-[11px] font-medium text-[#1D1D1F] dark:text-[#F5F5F7] shadow-2xs border border-black/[0.04] dark:border-white/[0.06]"
                >
                  #{tag}
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(tag)}
                    className="text-[#86868B] hover:text-[#1D1D1F] dark:hover:text-white ml-0.5"
                  >
                    ×
                  </button>
                </span>
              ))}
              <input
                type="text"
                value={tagsInput}
                onChange={(e) => setTagsInput(e.target.value)}
                onKeyDown={handleAddTag}
                placeholder={tags.length === 0 ? "Type tag & hit Enter..." : "Add tag..."}
                className="flex-1 min-w-[120px] bg-transparent text-xs text-[#1D1D1F] dark:text-white focus:outline-none placeholder-[#86868B]"
              />
            </div>
          </div>

          {/* Modal Footer */}
          <div className="flex items-center justify-between pt-4 border-t border-black/[0.05] dark:border-white/[0.08]">
            {isEditing && onDelete && initialTask ? (
              <button
                type="button"
                id="btn-delete-task-modal"
                onClick={() => {
                  onDelete(initialTask.id);
                  onClose();
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium text-[#FF3B30] hover:bg-[#FF3B30]/10 transition-colors cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Delete
              </button>
            ) : (
              <div />
            )}

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-1.5 text-xs font-medium text-[#86868B] hover:text-[#1D1D1F] dark:hover:text-white rounded-full transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                id="btn-save-task-modal"
                className="inline-flex items-center gap-1.5 px-5 py-2 text-xs font-bold bg-[#1C1C1F] hover:bg-[#2C2C30] dark:bg-white dark:hover:bg-gray-100 text-white dark:text-[#1C1C1F] rounded-xl shadow-xs active:scale-95 transition-all cursor-pointer"
              >
                <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                {isEditing ? "Save Changes" : "Create Task"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
