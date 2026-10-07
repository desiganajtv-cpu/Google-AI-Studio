import React, { useState } from "react";
import { Priority, Task } from "../types/task";
import { parseNaturalLanguageTask } from "../utils/naturalLanguageParser";
import { getTodayString } from "../utils/dateUtils";
import { Plus, ArrowRight, Sparkles } from "lucide-react";

interface QuickAddInlineProps {
  onQuickAdd: (taskData: Omit<Task, "id" | "createdAt" | "updatedAt">) => void;
  onOpenFullModal: () => void;
  categories: string[];
}

export const QuickAddInline: React.FC<QuickAddInlineProps> = ({
  onQuickAdd,
  onOpenFullModal,
  categories,
}) => {
  const [input, setInput] = useState("");
  const [isFocused, setIsFocused] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    // Use smart natural language parser to extract date, time, priority if present
    const parsed = parseNaturalLanguageTask(input, categories);

    onQuickAdd({
      title: parsed.title,
      category: parsed.category || categories[0] || "General",
      priority: parsed.priority || "medium",
      status: "pending",
      scheduledDate: parsed.scheduledDate || getTodayString(),
      scheduledTime: parsed.scheduledTime,
      reminderEnabled: !!parsed.scheduledTime,
      reminderTime: "15m",
    });

    setInput("");
  };

  const parsedHint = input.trim().length > 3 ? parseNaturalLanguageTask(input, categories) : null;
  const hasExtractedInfo =
    parsedHint &&
    (parsedHint.rawMatched.dateText ||
      parsedHint.rawMatched.timeText ||
      parsedHint.rawMatched.priorityText ||
      parsedHint.rawMatched.categoryText);

  return (
    <div className="space-y-1.5">
      <form
        onSubmit={handleSubmit}
        className={`flex items-center gap-2 p-1.5 sm:p-2 bg-white dark:bg-[#151922] border rounded-2xl transition-all ${
          isFocused
            ? "border-neutral-900 dark:border-white shadow-xs"
            : "border-neutral-200/90 dark:border-neutral-800/90 shadow-2xs hover:border-neutral-300 dark:hover:border-neutral-700"
        }`}
      >
        <button
          type="button"
          onClick={onOpenFullModal}
          title="Open detailed add form"
          className="p-1.5 text-neutral-400 hover:text-neutral-900 dark:hover:text-white rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors shrink-0"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
        </button>

        <input
          id="input-inline-quick-add"
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder="Quick add: e.g. 'Muthamizh Academy Hosting Server today 5pm urgent'..."
          className="flex-1 bg-transparent text-xs sm:text-sm text-neutral-900 dark:text-white placeholder-neutral-400 dark:placeholder-neutral-500 focus:outline-none"
        />

        <div className="flex items-center gap-1 shrink-0">
          <button
            type="submit"
            disabled={!input.trim()}
            className="inline-flex items-center gap-1 px-3 py-1.5 bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 text-xs font-semibold rounded-xl disabled:opacity-30 hover:opacity-90 active:scale-95 transition-all shadow-2xs"
          >
            <span>Add</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>
      </form>

      {/* Live parsing detection badge row */}
      {hasExtractedInfo && parsedHint && (
        <div className="flex items-center gap-1.5 px-3 text-[11px] text-neutral-500 dark:text-neutral-400 animate-in fade-in">
          <Sparkles className="w-3 h-3 text-amber-500 shrink-0" />
          <span className="font-medium text-neutral-700 dark:text-neutral-300">Detected:</span>
          {parsedHint.rawMatched.dateText && (
            <span className="px-1.5 py-0.2 rounded bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 font-semibold">
              📅 {parsedHint.rawMatched.dateText}
            </span>
          )}
          {parsedHint.rawMatched.timeText && (
            <span className="px-1.5 py-0.2 rounded bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 font-semibold">
              ⏰ {parsedHint.rawMatched.timeText}
            </span>
          )}
          {parsedHint.rawMatched.priorityText && (
            <span className="px-1.5 py-0.2 rounded bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 font-semibold">
              🔴 {parsedHint.rawMatched.priorityText}
            </span>
          )}
          {parsedHint.rawMatched.categoryText && (
            <span className="px-1.5 py-0.2 rounded bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 font-semibold">
              📁 {parsedHint.rawMatched.categoryText}
            </span>
          )}
        </div>
      )}
    </div>
  );
};
