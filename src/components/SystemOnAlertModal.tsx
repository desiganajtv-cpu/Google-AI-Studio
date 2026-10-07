import React from "react";
import { Task } from "../types/task";
import { formatTimeDisplay, getTodayString } from "../utils/dateUtils";
import { AlertTriangle, Calendar, CheckCircle2, Clock, X, ArrowRight } from "lucide-react";

interface SystemOnAlertModalProps {
  isOpen: boolean;
  overdueTasks: Task[];
  todayTasks: Task[];
  onClose: () => void;
  onFocusToday: () => void;
  onFilterOverdue: () => void;
  onRescheduleOverdueToToday: () => void;
  onCompleteTask: (taskId: string) => void;
}

export const SystemOnAlertModal: React.FC<SystemOnAlertModalProps> = ({
  isOpen,
  overdueTasks,
  todayTasks,
  onClose,
  onFocusToday,
  onFilterOverdue,
  onRescheduleOverdueToToday,
  onCompleteTask,
}) => {
  if (!isOpen) return null;

  const totalCount = overdueTasks.length + todayTasks.length;
  const hasOverdue = overdueTasks.length > 0;

  return (
    <div
      id="system-on-alert-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-neutral-900/60 backdrop-blur-xs animate-fade-in"
      role="dialog"
      aria-labelledby="system-on-title"
    >
      <div className="w-full max-w-lg bg-white dark:bg-[#151922] rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div
          className={`px-5 py-4 flex items-center justify-between border-b ${
            hasOverdue
              ? "bg-amber-500/10 border-amber-500/20 text-amber-900 dark:text-amber-200"
              : "bg-blue-500/10 border-blue-500/20 text-blue-900 dark:text-blue-200"
          }`}
        >
          <div className="flex items-center gap-2.5">
            <span className={`p-2 rounded-xl ${hasOverdue ? "bg-amber-500 text-white" : "bg-blue-500 text-white"}`}>
              {hasOverdue ? <AlertTriangle className="w-4 h-4" /> : <Clock className="w-4 h-4" />}
            </span>
            <div>
              <h2 id="system-on-title" className="text-sm font-bold tracking-tight">
                System Startup: Due Date Audit
              </h2>
              <p className="text-[11px] opacity-80">
                {hasOverdue
                  ? `${overdueTasks.length} overdue item(s) & ${todayTasks.length} scheduled for today`
                  : `${todayTasks.length} task(s) ready for today`}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-neutral-200/50 dark:hover:bg-neutral-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content list */}
        <div className="p-5 space-y-4 overflow-y-auto flex-1">
          {/* Overdue Section */}
          {hasOverdue && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-rose-600 dark:text-rose-400 flex items-center gap-1.5 uppercase tracking-wider">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  Overdue Tasks ({overdueTasks.length})
                </span>
                <button
                  onClick={onRescheduleOverdueToToday}
                  className="text-[11px] font-semibold text-rose-600 dark:text-rose-400 hover:underline"
                >
                  Move all to Today
                </button>
              </div>

              <div className="space-y-1.5">
                {overdueTasks.slice(0, 5).map((task) => (
                  <div
                    key={task.id}
                    className="p-2.5 rounded-xl bg-rose-50/60 dark:bg-rose-950/20 border border-rose-200/70 dark:border-rose-900/40 flex items-center justify-between gap-3 text-xs"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold uppercase px-1.5 py-0.5 rounded bg-rose-200/80 dark:bg-rose-900/60 text-rose-800 dark:text-rose-300">
                          {task.priority}
                        </span>
                        <span className="font-semibold text-neutral-900 dark:text-white truncate">
                          {task.title}
                        </span>
                      </div>
                      <span className="text-[11px] text-rose-600 dark:text-rose-400 mt-0.5 block">
                        Was due: {task.scheduledDate} {task.scheduledTime ? `at ${task.scheduledTime}` : ""}
                      </span>
                    </div>

                    <button
                      onClick={() => onCompleteTask(task.id)}
                      title="Mark finished"
                      className="p-1.5 rounded-lg text-rose-700 dark:text-rose-300 hover:bg-rose-200/70 dark:hover:bg-rose-900/50 transition-colors shrink-0"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
                {overdueTasks.length > 5 && (
                  <p className="text-[11px] text-neutral-500 dark:text-neutral-400 text-center py-1">
                    + {overdueTasks.length - 5} more overdue tasks
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Today's Tasks Section */}
          {todayTasks.length > 0 && (
            <div className="space-y-2">
              <span className="text-xs font-bold text-neutral-700 dark:text-neutral-300 flex items-center gap-1.5 uppercase tracking-wider">
                <Calendar className="w-3.5 h-3.5 text-blue-500" />
                Scheduled for Today ({todayTasks.length})
              </span>

              <div className="space-y-1.5">
                {todayTasks.slice(0, 4).map((task) => (
                  <div
                    key={task.id}
                    className="p-2.5 rounded-xl bg-neutral-50 dark:bg-neutral-900/60 border border-neutral-200/80 dark:border-neutral-800 flex items-center justify-between gap-3 text-xs"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-neutral-900 dark:text-white truncate">
                          {task.title}
                        </span>
                        <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-neutral-200/70 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 shrink-0">
                          {task.category}
                        </span>
                      </div>
                      {task.scheduledTime && (
                        <span className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-0.5 block flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {formatTimeDisplay(task.scheduledTime)}
                        </span>
                      )}
                    </div>

                    <button
                      onClick={() => onCompleteTask(task.id)}
                      title="Mark finished"
                      className="p-1.5 rounded-lg text-neutral-500 hover:text-emerald-600 hover:bg-neutral-200/60 dark:hover:bg-neutral-800 transition-colors shrink-0"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
                {todayTasks.length > 4 && (
                  <p className="text-[11px] text-neutral-500 dark:text-neutral-400 text-center py-1">
                    + {todayTasks.length - 4} more today tasks
                  </p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="px-5 py-3.5 border-t border-neutral-100 dark:border-neutral-800 bg-neutral-50/50 dark:bg-[#12161f]/50 flex flex-col sm:flex-row items-center justify-between gap-2.5">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            {hasOverdue && (
              <button
                onClick={() => {
                  onFilterOverdue();
                  onClose();
                }}
                className="flex-1 sm:flex-initial px-3 py-1.5 rounded-xl border border-neutral-300 dark:border-neutral-700 text-xs font-semibold text-neutral-800 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
              >
                View Overdue
              </button>
            )}
            <button
              onClick={() => {
                onFocusToday();
                onClose();
              }}
              className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs transition-colors"
            >
              <span>Today&apos;s Focus</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <button
            onClick={onClose}
            className="w-full sm:w-auto px-4 py-1.5 rounded-xl bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 text-xs font-semibold shadow-xs hover:opacity-90 transition-all"
          >
            Acknowledge & Continue
          </button>
        </div>
      </div>
    </div>
  );
};
