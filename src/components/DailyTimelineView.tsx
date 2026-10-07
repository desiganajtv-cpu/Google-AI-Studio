import React, { useState } from "react";
import { Task, Priority, TaskStatus } from "../types/task";
import { TaskCard } from "./TaskCard";
import { getTodayString, formatTimeDisplay } from "../utils/dateUtils";
import { Calendar, ChevronLeft, ChevronRight } from "lucide-react";

interface DailyTimelineViewProps {
  tasks: Task[];
  onToggleComplete: (id: string) => void;
  onStartTask: (id: string) => void;
  onSetStatus: (id: string, status: TaskStatus) => void;
  onSetPriority: (id: string, priority: Priority) => void;
  onReschedule: (id: string, date?: string, time?: string) => void;
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
}

export const DailyTimelineView: React.FC<DailyTimelineViewProps> = ({
  tasks,
  onToggleComplete,
  onStartTask,
  onSetStatus,
  onSetPriority,
  onReschedule,
  onEdit,
  onDelete,
}) => {
  const [selectedDate, setSelectedDate] = useState<string>(getTodayString());

  const handleDateShift = (days: number) => {
    const [y, m, d] = selectedDate.split("-").map(Number);
    const dateObj = new Date(y, m - 1, d);
    dateObj.setDate(dateObj.getDate() + days);
    const year = dateObj.getFullYear();
    const month = String(dateObj.getMonth() + 1).padStart(2, "0");
    const day = String(dateObj.getDate()).padStart(2, "0");
    setSelectedDate(`${year}-${month}-${day}`);
  };

  const [y, m, d] = selectedDate.split("-").map(Number);
  const displayDateObj = new Date(y, m - 1, d);
  const formattedDayTitle = displayDateObj.toLocaleDateString("en-US", {
    weekday: "long",
    day: "numeric",
    month: "short",
    year: "numeric",
  }).toUpperCase();

  const isCurrentDayToday = selectedDate === getTodayString();

  // Filter tasks for this selected date
  const dateTasks = tasks.filter((t) => t.scheduledDate === selectedDate);
  const timedTasks = dateTasks
    .filter((t) => !!t.scheduledTime)
    .sort((a, b) => (a.scheduledTime || "").localeCompare(b.scheduledTime || ""));
  const unscheduledDayTasks = dateTasks.filter((t) => !t.scheduledTime);

  // Unscheduled tasks with NO scheduled date at all
  const noScheduleTasks = tasks.filter((t) => !t.scheduledDate && t.status !== "completed");

  return (
    <div className="space-y-6">
      {/* Date Navigation Bar */}
      <div className="flex items-center justify-between p-3 bg-white dark:bg-[#151922] rounded-xl border border-neutral-200/80 dark:border-neutral-800/80">
        <button
          onClick={() => handleDateShift(-1)}
          className="p-1.5 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-600 dark:text-neutral-400"
          title="Previous day"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-neutral-400" />
          <span className="text-xs sm:text-sm font-bold tracking-wider text-neutral-900 dark:text-white">
            {formattedDayTitle}
          </span>
          {isCurrentDayToday && (
            <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded-md bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400">
              Today
            </span>
          )}
        </div>

        <div className="flex items-center gap-1">
          {!isCurrentDayToday && (
            <button
              onClick={() => setSelectedDate(getTodayString())}
              className="px-2 py-1 text-xs font-semibold rounded-md bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 mr-1"
            >
              Today
            </button>
          )}
          <button
            onClick={() => handleDateShift(1)}
            className="p-1.5 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-600 dark:text-neutral-400"
            title="Next day"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Daily Timeline */}
      <div className="space-y-4">
        {timedTasks.length === 0 && unscheduledDayTasks.length === 0 ? (
          <div className="py-12 text-center rounded-xl border border-dashed border-neutral-200 dark:border-neutral-800 text-neutral-500 text-xs">
            No tasks scheduled for this day.
          </div>
        ) : (
          timedTasks.map((task, idx) => (
            <div key={task.id} className="space-y-1.5">
              {/* Timeline Divider with Time Stamp */}
              <div className="flex items-center gap-3">
                <span className="text-xs font-mono font-bold text-neutral-700 dark:text-neutral-300 shrink-0 bg-neutral-100 dark:bg-neutral-800 px-2 py-0.5 rounded-md">
                  {formatTimeDisplay(task.scheduledTime)}
                </span>
                <div className="h-px bg-neutral-200 dark:bg-neutral-800 flex-1" />
              </div>
              <div className="pl-4 sm:pl-8">
                <TaskCard
                  task={task}
                  index={idx}
                  onToggleComplete={onToggleComplete}
                  onStartTask={onStartTask}
                  onSetStatus={onSetStatus}
                  onSetPriority={onSetPriority}
                  onReschedule={onReschedule}
                  onEdit={onEdit}
                  onDelete={onDelete}
                />
              </div>
            </div>
          ))
        )}

        {/* Any unscheduled tasks for this day */}
        {unscheduledDayTasks.length > 0 && (
          <div className="pt-4 border-t border-neutral-200 dark:border-neutral-800 space-y-2">
            <div className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">
              Anytime on this day ({unscheduledDayTasks.length})
            </div>
            {unscheduledDayTasks.map((task, idx) => (
              <TaskCard
                key={task.id}
                task={task}
                index={idx}
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
        )}
      </div>

      {/* NO SCHEDULE SECTION */}
      {noScheduleTasks.length > 0 && (
        <div className="pt-6 border-t border-neutral-200 dark:border-neutral-800 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-neutral-400">
              NO SCHEDULE ({noScheduleTasks.length})
            </span>
            <span className="text-[11px] text-neutral-400">
              Tasks without a date assigned
            </span>
          </div>

          <div className="space-y-2.5">
            {noScheduleTasks.map((task, idx) => (
              <TaskCard
                key={task.id}
                task={task}
                index={idx}
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
        </div>
      )}
    </div>
  );
};
