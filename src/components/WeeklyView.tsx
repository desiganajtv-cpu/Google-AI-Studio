import React, { useState } from "react";
import { Task, Priority } from "../types/task";
import { PRIORITY_CONFIG } from "../utils/priority";
import { formatTimeDisplay, getTodayString } from "../utils/dateUtils";
import { ChevronLeft, ChevronRight, Calendar, Check, Clock } from "lucide-react";

interface WeeklyViewProps {
  tasks: Task[];
  onSelectTask: (task: Task) => void;
  onToggleComplete: (id: string) => void;
}

export const WeeklyView: React.FC<WeeklyViewProps> = ({
  tasks,
  onSelectTask,
  onToggleComplete,
}) => {
  const [weekOffset, setWeekOffset] = useState<number>(0);

  // Compute Monday of current week + weekOffset
  const getWeekDates = (offsetWeeks: number) => {
    const now = new Date();
    const currentDay = now.getDay(); // 0 is Sunday, 1 is Monday
    const distanceToMonday = currentDay === 0 ? -6 : 1 - currentDay;

    const monday = new Date(now);
    monday.setDate(now.getDate() + distanceToMonday + offsetWeeks * 7);

    const days = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, "0");
      const dayStr = String(d.getDate()).padStart(2, "0");
      const dateString = `${y}-${m}-${dayStr}`;
      days.push({
        dateString,
        dayName: d.toLocaleDateString("en-US", { weekday: "short" }),
        dayNumber: d.getDate(),
        monthName: d.toLocaleDateString("en-US", { month: "short" }),
        isToday: dateString === getTodayString(),
      });
    }
    return days;
  };

  const weekDays = getWeekDates(weekOffset);
  const todayStr = getTodayString();

  return (
    <div className="space-y-4">
      {/* Week Navigation */}
      <div className="flex items-center justify-between p-3 bg-white dark:bg-[#151922] rounded-xl border border-neutral-200/80 dark:border-neutral-800/80">
        <button
          onClick={() => setWeekOffset((prev) => prev - 1)}
          className="p-1.5 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-600 dark:text-neutral-400"
          title="Previous week"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-2 text-xs sm:text-sm font-bold text-neutral-900 dark:text-white">
          <Calendar className="w-4 h-4 text-neutral-400" />
          <span>
            {weekDays[0].monthName} {weekDays[0].dayNumber} – {weekDays[6].monthName} {weekDays[6].dayNumber}
          </span>
          {weekOffset === 0 && (
            <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded-md bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400">
              Current Week
            </span>
          )}
        </div>

        <div className="flex items-center gap-1">
          {weekOffset !== 0 && (
            <button
              onClick={() => setWeekOffset(0)}
              className="px-2 py-1 text-xs font-semibold rounded-md bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 mr-1"
            >
              This Week
            </button>
          )}
          <button
            onClick={() => setWeekOffset((prev) => prev + 1)}
            className="p-1.5 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-600 dark:text-neutral-400"
            title="Next week"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Week Columns Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-7 gap-3">
        {weekDays.map((day) => {
          const dayTasks = tasks.filter((t) => t.scheduledDate === day.dateString);
          dayTasks.sort((a, b) => (a.scheduledTime || "99:99").localeCompare(b.scheduledTime || "99:99"));

          return (
            <div
              key={day.dateString}
              className={`flex flex-col rounded-xl border p-2.5 min-h-[220px] transition-all ${
                day.isToday
                  ? "bg-blue-50/20 dark:bg-blue-950/20 border-blue-300 dark:border-blue-800/60 shadow-2xs"
                  : "bg-white dark:bg-[#151922] border-neutral-200/80 dark:border-neutral-800/80"
              }`}
            >
              {/* Day Header */}
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-neutral-100 dark:border-neutral-800/80">
                <div className="flex items-baseline gap-1.5">
                  <span
                    className={`text-xs font-bold uppercase tracking-wider ${
                      day.isToday ? "text-blue-600 dark:text-blue-400" : "text-neutral-500 dark:text-neutral-400"
                    }`}
                  >
                    {day.dayName}
                  </span>
                  <span
                    className={`text-sm font-bold ${
                      day.isToday ? "text-blue-600 dark:text-blue-400" : "text-neutral-800 dark:text-neutral-200"
                    }`}
                  >
                    {day.dayNumber}
                  </span>
                </div>
                {dayTasks.length > 0 && (
                  <span className="text-[10px] font-semibold px-1.5 py-0.2 rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-500">
                    {dayTasks.length}
                  </span>
                )}
              </div>

              {/* Task Items */}
              <div className="space-y-1.5 flex-1">
                {dayTasks.length === 0 ? (
                  <div className="h-full flex items-center justify-center text-[11px] text-neutral-400 italic py-6">
                    Empty
                  </div>
                ) : (
                  dayTasks.map((task) => {
                    const prio = PRIORITY_CONFIG[task.priority];
                    const isCompleted = task.status === "completed";

                    return (
                      <div
                        key={task.id}
                        className={`p-2 rounded-lg border text-xs cursor-pointer transition-all hover:scale-[1.02] active:scale-95 ${
                          isCompleted
                            ? "bg-neutral-50 dark:bg-neutral-900 border-neutral-200/60 dark:border-neutral-800 opacity-60 line-through"
                            : "bg-white dark:bg-neutral-800/90 border-neutral-200/80 dark:border-neutral-700 shadow-2xs"
                        }`}
                        onClick={() => onSelectTask(task)}
                      >
                        <div className="flex items-start gap-1.5">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onToggleComplete(task.id);
                            }}
                            className={`mt-0.5 w-3.5 h-3.5 rounded border flex items-center justify-center shrink-0 ${
                              isCompleted
                                ? "bg-emerald-500 border-emerald-500 text-white"
                                : "border-neutral-300 dark:border-neutral-600 text-transparent"
                            }`}
                          >
                            <Check className="w-2.5 h-2.5 stroke-[3]" />
                          </button>

                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-1">
                              <span className={`w-1.5 h-1.5 rounded-full ${prio.dotColor} shrink-0`} />
                              <span className="font-semibold text-neutral-900 dark:text-white truncate">
                                {task.title}
                              </span>
                            </div>

                            {task.scheduledTime && (
                              <div className="flex items-center gap-1 text-[10px] text-neutral-500 dark:text-neutral-400 mt-0.5">
                                <Clock className="w-2.5 h-2.5" />
                                <span>{formatTimeDisplay(task.scheduledTime)}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
