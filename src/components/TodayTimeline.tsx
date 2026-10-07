import React from "react";
import { Task, Priority, TaskStatus } from "../types/task";
import { TaskCard } from "./TaskCard";
import { formatTimeDisplay, isOverdue } from "../utils/dateUtils";
import { AlertTriangle, Clock, CalendarDays, Plus } from "lucide-react";

interface TodayTimelineProps {
  tasks: Task[];
  onToggleComplete: (id: string) => void;
  onStartTask: (id: string) => void;
  onSetStatus: (id: string, status: TaskStatus) => void;
  onSetPriority: (id: string, priority: Priority) => void;
  onReschedule: (id: string, date?: string, time?: string) => void;
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
  onReorder: (startIndex: number, endIndex: number) => void;
  onOpenQuickAdd: () => void;
}

export const TodayTimeline: React.FC<TodayTimelineProps> = ({
  tasks,
  onToggleComplete,
  onStartTask,
  onSetStatus,
  onSetPriority,
  onReschedule,
  onEdit,
  onDelete,
  onReorder,
  onOpenQuickAdd,
}) => {
  // Separate into Overdue, Today Timed, and Today Unscheduled
  const overdueTasks: Task[] = [];
  const timedTasks: Task[] = [];
  const unscheduledTasks: Task[] = [];

  tasks.forEach((t) => {
    if (isOverdue(t.scheduledDate, t.scheduledTime, t.status)) {
      overdueTasks.push(t);
    } else if (t.scheduledTime) {
      timedTasks.push(t);
    } else {
      unscheduledTasks.push(t);
    }
  });

  // Sort timed tasks chronologically
  timedTasks.sort((a, b) => (a.scheduledTime || "").localeCompare(b.scheduledTime || ""));

  if (tasks.length === 0) {
    return (
      <div className="py-16 text-center rounded-2xl border border-dashed border-neutral-200 dark:border-neutral-800 bg-white/50 dark:bg-[#151922]/50 p-8">
        <div className="w-12 h-12 rounded-full bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center mx-auto mb-3">
          <CalendarDays className="w-6 h-6" />
        </div>
        <h3 className="text-base font-semibold text-neutral-900 dark:text-white">
          No tasks scheduled for Today
        </h3>
        <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1 max-w-sm mx-auto">
          Capture what you and your colleague want to tackle today.
        </p>
        <button
          onClick={onOpenQuickAdd}
          className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 text-xs font-semibold shadow-xs hover:opacity-90 active:scale-95 transition-all"
        >
          <Plus className="w-4 h-4" />
          Schedule Task For Today
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Overdue Section if any */}
      {overdueTasks.length > 0 && (
        <section className="space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400">
            <AlertTriangle className="w-4 h-4" />
            <span>Overdue ({overdueTasks.length})</span>
          </div>
          <div className="space-y-2.5">
            {overdueTasks.map((task, idx) => (
              <TaskCard
                key={task.id}
                task={task}
                index={idx}
                draggable={true}
                onToggleComplete={onToggleComplete}
                onStartTask={onStartTask}
                onSetStatus={onSetStatus}
                onSetPriority={onSetPriority}
                onReschedule={onReschedule}
                onEdit={onEdit}
                onDelete={onDelete}
              />
            ))}
          </div>
        </section>
      )}

      {/* Timed Section: Chronological stream */}
      {timedTasks.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
            <Clock className="w-4 h-4" />
            <span>Today&apos;s Schedule</span>
          </div>

          <div className="space-y-4">
            {timedTasks.map((task, idx) => (
              <div key={task.id} className="relative pl-6 sm:pl-8 border-l-2 border-neutral-200 dark:border-neutral-800 ml-2 sm:ml-3">
                {/* Time Indicator Node */}
                <div className="absolute -left-[9px] top-4 w-4 h-4 rounded-full bg-white dark:bg-[#151922] border-2 border-neutral-400 dark:border-neutral-600 flex items-center justify-center">
                  <div className="w-1.5 h-1.5 rounded-full bg-neutral-900 dark:bg-white" />
                </div>

                <div className="mb-1.5">
                  <span className="text-xs font-bold text-neutral-900 dark:text-white font-mono bg-neutral-100 dark:bg-neutral-800/80 px-2 py-0.5 rounded-md">
                    {formatTimeDisplay(task.scheduledTime)}
                  </span>
                </div>

                <TaskCard
                  task={task}
                  index={idx}
                  draggable={true}
                  onToggleComplete={onToggleComplete}
                  onStartTask={onStartTask}
                  onSetStatus={onSetStatus}
                  onSetPriority={onSetPriority}
                  onReschedule={onReschedule}
                  onEdit={onEdit}
                  onDelete={onDelete}
                />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Unscheduled for Today */}
      {unscheduledTasks.length > 0 && (
        <section className="space-y-3 pt-2">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-neutral-400">
            <span>Anytime Today / No Fixed Time ({unscheduledTasks.length})</span>
          </div>
          <div className="space-y-2.5">
            {unscheduledTasks.map((task, idx) => (
              <TaskCard
                key={task.id}
                task={task}
                index={idx}
                draggable={true}
                onToggleComplete={onToggleComplete}
                onStartTask={onStartTask}
                onSetStatus={onSetStatus}
                onSetPriority={onSetPriority}
                onReschedule={onReschedule}
                onEdit={onEdit}
                onDelete={onDelete}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
};
