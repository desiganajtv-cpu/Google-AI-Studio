import React from "react";
import { Task } from "../types/task";
import { PRIORITY_CONFIG } from "../utils/priority";
import { formatTimeDisplay, isOverdue } from "../utils/dateUtils";
import { Play, Check, Clock, Sparkles } from "lucide-react";

interface WhatsNextBannerProps {
  task: Task | null;
  onStartTask: (id: string) => void;
  onCompleteTask: (id: string) => void;
  onSelectTask: (task: Task) => void;
}

export const WhatsNextBanner: React.FC<WhatsNextBannerProps> = ({
  task,
  onStartTask,
  onCompleteTask,
  onSelectTask,
}) => {
  if (!task) return null;

  const prio = PRIORITY_CONFIG[task.priority];
  const overdue = isOverdue(task.scheduledDate, task.scheduledTime, task.status);
  const isInProgress = task.status === "in_progress";

  return (
    <div
      id="whats-next-card"
      className="p-3.5 sm:p-4 rounded-xl bg-neutral-900 dark:bg-[#1a202c] text-white border border-neutral-800 dark:border-neutral-700/80 shadow-sm relative overflow-hidden transition-all"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 relative z-10">
        <div className="space-y-1 max-w-xl">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold tracking-wider uppercase text-neutral-400 dark:text-neutral-400">
              <Sparkles className="w-3 h-3 text-amber-400" />
              What&apos;s Next?
            </span>
            {isInProgress && (
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 font-medium border border-blue-500/30 animate-pulse">
                In Progress
              </span>
            )}
            {overdue && !isInProgress && (
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 font-medium border border-rose-500/30">
                Needs Immediate Attention
              </span>
            )}
          </div>

          <div
            onClick={() => onSelectTask(task)}
            className="cursor-pointer group flex items-start gap-2"
          >
            <span className={`w-2 h-2 rounded-full ${prio.dotColor} mt-2 shrink-0`} />
            <h3 className="text-base sm:text-lg font-semibold tracking-tight text-white group-hover:text-neutral-200 transition-colors line-clamp-1">
              {task.title}
            </h3>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs text-neutral-400 pt-0.5">
            <span className="px-2 py-0.5 rounded-md bg-neutral-800 dark:bg-neutral-800/80 text-neutral-300 font-medium">
              {task.category}
            </span>
            <span>•</span>
            <span className={`font-medium ${prio.textColor}`}>
              {prio.label} Priority
            </span>
            {task.scheduledTime && (
              <>
                <span>•</span>
                <span className="inline-flex items-center gap-1 text-neutral-300">
                  <Clock className="w-3 h-3" />
                  Scheduled for {formatTimeDisplay(task.scheduledTime)}
                </span>
              </>
            )}
          </div>
        </div>

        {/* Action Button */}
        <div className="flex items-center gap-2 shrink-0 self-start sm:self-center">
          {isInProgress ? (
            <button
              id="btn-whats-next-complete"
              onClick={() => onCompleteTask(task.id)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-semibold shadow-xs transition-all active:scale-95"
            >
              <Check className="w-3.5 h-3.5 stroke-[2.5]" />
              Complete Task
            </button>
          ) : (
            <button
              id="btn-whats-next-start"
              onClick={() => onStartTask(task.id)}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-white hover:bg-neutral-100 text-neutral-900 text-xs font-semibold shadow-xs transition-all active:scale-95"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              Start Task
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
