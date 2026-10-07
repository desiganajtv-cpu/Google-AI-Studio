import React, { useState } from "react";
import { Task, Priority, TaskStatus } from "../types/task";
import { PRIORITY_CONFIG, STATUS_CONFIG } from "../utils/priority";
import { getSmartTimeLabel, formatCompletedAt } from "../utils/dateUtils";
import { RescheduleMenu } from "./RescheduleMenu";
import {
  Check,
  Play,
  Clock,
  MoreVertical,
  Trash2,
  Edit2,
  Bell,
  AlertTriangle,
  GripVertical,
} from "lucide-react";

interface TaskCardProps {
  task: Task;
  onToggleComplete: (id: string) => void;
  onStartTask: (id: string) => void;
  onSetStatus: (id: string, status: TaskStatus) => void;
  onSetPriority: (id: string, priority: Priority) => void;
  onReschedule: (id: string, date?: string, time?: string) => void;
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
  draggable?: boolean;
  onDragStart?: (e: React.DragEvent, index: number) => void;
  onDragOver?: (e: React.DragEvent, index: number) => void;
  onDrop?: (e: React.DragEvent, index: number) => void;
  index?: number;
}

export const TaskCard: React.FC<TaskCardProps> = ({
  task,
  onToggleComplete,
  onStartTask,
  onSetStatus,
  onSetPriority,
  onReschedule,
  onEdit,
  onDelete,
  draggable = false,
  onDragStart,
  onDragOver,
  onDrop,
  index = 0,
}) => {
  const [showReschedule, setShowReschedule] = useState(false);
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [showStatusMenu, setShowStatusMenu] = useState(false);
  const [showPriorityMenu, setShowPriorityMenu] = useState(false);

  const prio = PRIORITY_CONFIG[task.priority];
  const statusCfg = STATUS_CONFIG[task.status];
  const timeInfo = getSmartTimeLabel(task.scheduledDate, task.scheduledTime, task.status);
  const isCompleted = task.status === "completed";

  return (
    <div
      id={`task-card-${task.id}`}
      draggable={draggable && !isCompleted}
      onDragStart={(e) => onDragStart && onDragStart(e, index)}
      onDragOver={(e) => onDragOver && onDragOver(e, index)}
      onDrop={(e) => onDrop && onDrop(e, index)}
      className={`group relative rounded-xl border p-3.5 sm:p-4 transition-all duration-150 ${
        isCompleted
          ? "bg-neutral-50/70 dark:bg-[#12161f]/50 border-neutral-200/60 dark:border-neutral-800/60 opacity-60 hover:opacity-90"
          : timeInfo.isOverdue
          ? "bg-white dark:bg-[#151922] border-amber-300/80 dark:border-amber-700/60 shadow-2xs hover:border-amber-400"
          : "bg-white dark:bg-[#151922] border-neutral-200/80 dark:border-neutral-800/80 shadow-2xs hover:border-neutral-300 dark:hover:border-neutral-700 hover:shadow-xs"
      }`}
    >
      <div className="flex items-start gap-3">
        {/* Drag handle & Place Badge */}
        {draggable && !isCompleted && (
          <div className="flex items-center gap-1.5 self-center">
            <div
              className="cursor-grab active:cursor-grabbing text-neutral-300 hover:text-neutral-500 dark:text-neutral-700 dark:hover:text-neutral-400 p-0.5"
              title="Drag to reorder"
            >
              <GripVertical className="w-4 h-4" />
            </div>
            <span
              className="w-5 h-5 rounded-md bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 flex items-center justify-center font-mono font-bold text-[10px] text-neutral-600 dark:text-neutral-300"
              title={`Position #${task.order || index + 1}`}
            >
              {task.order || index + 1}
            </span>
          </div>
        )}

        {/* Checkbox */}
        <button
          id={`btn-complete-${task.id}`}
          onClick={() => onToggleComplete(task.id)}
          title={isCompleted ? "Reopen task" : "Mark as completed"}
          className={`mt-0.5 w-5 h-5 rounded-md border flex items-center justify-center shrink-0 transition-all cursor-pointer ${
            isCompleted
              ? "bg-emerald-500 border-emerald-500 text-white shadow-2xs"
              : "border-neutral-300 dark:border-neutral-700 hover:border-neutral-500 text-transparent hover:text-neutral-300"
          }`}
        >
          <Check className="w-3.5 h-3.5 stroke-[3]" />
        </button>

        {/* Content Area */}
        <div className="flex-1 min-w-0">
          {/* Top Line: Priority Dot + Title + Overdue Pill */}
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2 flex-wrap min-w-0">
              {/* Priority Dot */}
              <button
                onClick={() => setShowPriorityMenu(!showPriorityMenu)}
                title={`Priority: ${prio.label} (Click to change)`}
                className="relative shrink-0 flex items-center justify-center"
              >
                <span className={`w-2.5 h-2.5 rounded-full ${prio.dotColor} block ring-2 ring-transparent hover:ring-neutral-300 dark:hover:ring-neutral-600 transition-all`} />
              </button>

              {/* Title */}
              <h4
                onClick={() => onEdit(task)}
                className={`text-sm sm:text-base font-semibold tracking-tight text-neutral-900 dark:text-white cursor-pointer hover:underline underline-offset-2 break-words ${
                  isCompleted ? "line-through text-neutral-500 dark:text-neutral-400" : ""
                }`}
              >
                {task.title}
              </h4>

              {/* Overdue Badge */}
              {timeInfo.isOverdue && !isCompleted && (
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-md bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-300/60 dark:border-amber-800">
                  <AlertTriangle className="w-3 h-3" />
                  Overdue
                </span>
              )}

              {/* Reminder icon */}
              {task.reminderEnabled && !isCompleted && (
                <span
                  title="Reminder set"
                  className="text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200"
                >
                  <Bell className="w-3 h-3 text-amber-500" />
                </span>
              )}
            </div>

            {/* Quick Actions (Hover on desktop, always accessible) */}
            <div className="flex items-center gap-1 shrink-0 relative">
              {/* Start Task (if pending or waiting) */}
              {!isCompleted && task.status !== "in_progress" && (
                <button
                  onClick={() => onStartTask(task.id)}
                  title="Start task (In Progress)"
                  className="p-1 rounded-md text-neutral-500 hover:text-blue-600 dark:text-neutral-400 dark:hover:text-blue-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                </button>
              )}

              {/* Reschedule button */}
              <div className="relative">
                <button
                  id={`btn-reschedule-${task.id}`}
                  onClick={() => setShowReschedule(!showReschedule)}
                  title="Quick reschedule"
                  className="p-1 rounded-md text-neutral-500 hover:text-neutral-800 dark:text-neutral-400 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                >
                  <Clock className="w-3.5 h-3.5" />
                </button>
                {showReschedule && (
                  <RescheduleMenu
                    currentDate={task.scheduledDate}
                    currentTime={task.scheduledTime}
                    onReschedule={(d, t) => onReschedule(task.id, d, t)}
                    onClose={() => setShowReschedule(false)}
                  />
                )}
              </div>

              {/* Edit */}
              <button
                onClick={() => onEdit(task)}
                title="Edit task"
                className="p-1 rounded-md text-neutral-500 hover:text-neutral-800 dark:text-neutral-400 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
              >
                <Edit2 className="w-3.5 h-3.5" />
              </button>

              {/* More menu */}
              <div className="relative">
                <button
                  onClick={() => setShowMoreMenu(!showMoreMenu)}
                  title="More actions"
                  className="p-1 rounded-md text-neutral-500 hover:text-neutral-800 dark:text-neutral-400 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                >
                  <MoreVertical className="w-3.5 h-3.5" />
                </button>
                {showMoreMenu && (
                  <div
                    className="absolute right-0 top-full mt-1 z-40 w-40 bg-white dark:bg-[#1b212d] rounded-xl border border-neutral-200 dark:border-neutral-700/80 shadow-lg p-1 text-xs"
                    onMouseLeave={() => setShowMoreMenu(false)}
                  >
                    <button
                      onClick={() => {
                        onEdit(task);
                        setShowMoreMenu(false);
                      }}
                      className="w-full text-left px-2.5 py-1.5 rounded-md hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-800 dark:text-neutral-200 flex items-center gap-2"
                    >
                      <Edit2 className="w-3 h-3 text-neutral-400" />
                      Edit Details
                    </button>
                    <button
                      onClick={() => {
                        onDelete(task.id);
                        setShowMoreMenu(false);
                      }}
                      className="w-full text-left px-2.5 py-1.5 rounded-md hover:bg-rose-50 dark:hover:bg-rose-950/40 text-rose-600 dark:text-rose-400 flex items-center gap-2"
                    >
                      <Trash2 className="w-3 h-3" />
                      Delete Task
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Description preview if exists */}
          {task.description && !isCompleted && (
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1 line-clamp-2 leading-relaxed">
              {task.description}
            </p>
          )}

          {/* Bottom Row: Category, Smart Time, Priority label, Status */}
          <div className="flex flex-wrap items-center justify-between gap-2 mt-2.5 pt-2 border-t border-neutral-100 dark:border-neutral-800/80 text-xs">
            {/* Left pills: Category & Scheduled Time */}
            <div className="flex items-center gap-2 flex-wrap">
              {/* Category pill */}
              <span className="px-2 py-0.5 rounded-md bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 font-medium text-[11px]">
                {task.category}
              </span>

              {/* Smart Time pill */}
              <span
                className={`inline-flex items-center gap-1 text-[11px] font-medium ${
                  timeInfo.isOverdue && !isCompleted
                    ? "text-amber-700 dark:text-amber-400 font-semibold"
                    : "text-neutral-500 dark:text-neutral-400"
                }`}
              >
                <Clock className="w-3 h-3" />
                {timeInfo.label}
              </span>

              {/* Completed timestamp if completed */}
              {isCompleted && task.completedAt && (
                <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
                  {formatCompletedAt(task.completedAt)}
                </span>
              )}
            </div>

            {/* Right pills: Priority badge & Status Pill */}
            <div className="flex items-center gap-2 relative">
              {/* Priority badge (clickable) */}
              <div className="relative">
                <button
                  onClick={() => setShowPriorityMenu(!showPriorityMenu)}
                  className={`px-2 py-0.5 rounded-md text-[11px] font-semibold border ${prio.bgColor} ${prio.textColor} ${prio.borderColor} hover:opacity-80 transition-opacity`}
                  title="Change priority"
                >
                  {prio.label}
                </button>
                {showPriorityMenu && (
                  <div
                    className="absolute right-0 bottom-full mb-1 z-40 w-32 bg-white dark:bg-[#1b212d] rounded-xl border border-neutral-200 dark:border-neutral-700 shadow-md p-1"
                    onMouseLeave={() => setShowPriorityMenu(false)}
                  >
                    {(["urgent", "high", "medium", "low"] as Priority[]).map((p) => {
                      const cfg = PRIORITY_CONFIG[p];
                      return (
                        <button
                          key={p}
                          onClick={() => {
                            onSetPriority(task.id, p);
                            setShowPriorityMenu(false);
                          }}
                          className="w-full text-left px-2 py-1 rounded-md hover:bg-neutral-100 dark:hover:bg-neutral-800 flex items-center gap-2 text-xs"
                        >
                          <span className={`w-2 h-2 rounded-full ${cfg.dotColor}`} />
                          <span className={cfg.textColor}>{cfg.label}</span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Status badge (clickable) */}
              <div className="relative">
                <button
                  onClick={() => setShowStatusMenu(!showStatusMenu)}
                  className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium border ${statusCfg.bgColor} ${statusCfg.textColor} ${statusCfg.borderColor} hover:opacity-85 transition-opacity`}
                  title="Change status"
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${statusCfg.dotColor}`} />
                  {statusCfg.label}
                </button>
                {showStatusMenu && (
                  <div
                    className="absolute right-0 bottom-full mb-1 z-40 w-36 bg-white dark:bg-[#1b212d] rounded-xl border border-neutral-200 dark:border-neutral-700 shadow-md p-1"
                    onMouseLeave={() => setShowStatusMenu(false)}
                  >
                    {(["pending", "in_progress", "waiting", "completed"] as TaskStatus[]).map((st) => {
                      const cfg = STATUS_CONFIG[st];
                      return (
                        <button
                          key={st}
                          onClick={() => {
                            onSetStatus(task.id, st);
                            setShowStatusMenu(false);
                          }}
                          className="w-full text-left px-2 py-1 rounded-md hover:bg-neutral-100 dark:hover:bg-neutral-800 flex items-center gap-2 text-xs"
                        >
                          <span className={`w-2 h-2 rounded-full ${cfg.dotColor}`} />
                          <span className={cfg.textColor}>{cfg.label}</span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
