import React, { useState } from "react";
import { Task, Priority, TaskStatus } from "../types/task";
import { TaskCard } from "./TaskCard";
import { CheckCircle2, SearchX, Plus, Sparkles } from "lucide-react";

interface TaskListProps {
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
  searchQuery: string;
  activeFilter: string;
}

export const TaskList: React.FC<TaskListProps> = ({
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
  searchQuery,
  activeFilter,
}) => {
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  const handleDragStart = (_e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (_e: React.DragEvent, dropIndex: number) => {
    if (draggedIndex === null || draggedIndex === dropIndex) return;
    onReorder(draggedIndex, dropIndex);
    setDraggedIndex(null);
  };

  if (tasks.length === 0) {
    if (searchQuery) {
      return (
        <div className="py-16 text-center rounded-2xl border border-dashed border-neutral-200 dark:border-neutral-800 bg-white/50 dark:bg-[#151922]/50 p-8">
          <div className="w-12 h-12 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center mx-auto text-neutral-400 mb-3">
            <SearchX className="w-6 h-6" />
          </div>
          <h3 className="text-base font-semibold text-neutral-900 dark:text-white">
            No tasks found
          </h3>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1 max-w-sm mx-auto">
            We couldn&apos;t find any tasks matching &quot;{searchQuery}&quot;. Try adjusting your search query or filters.
          </p>
        </div>
      );
    }

    if (activeFilter === "completed") {
      return (
        <div className="py-16 text-center rounded-2xl border border-dashed border-neutral-200 dark:border-neutral-800 bg-white/50 dark:bg-[#151922]/50 p-8">
          <div className="w-12 h-12 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto mb-3">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <h3 className="text-base font-semibold text-neutral-900 dark:text-white">
            No completed tasks yet
          </h3>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1 max-w-sm mx-auto">
            When you complete tasks, they will appear here with completion timestamps.
          </p>
        </div>
      );
    }

    return (
      <div className="py-16 text-center rounded-2xl border border-dashed border-neutral-200 dark:border-neutral-800 bg-white/50 dark:bg-[#151922]/50 p-8">
        <div className="w-12 h-12 rounded-full bg-amber-50 dark:bg-amber-950/40 text-amber-500 flex items-center justify-center mx-auto mb-3">
          <Sparkles className="w-6 h-6" />
        </div>
        <h3 className="text-base font-semibold text-neutral-900 dark:text-white">
          You&apos;re all clear 🎉
        </h3>
        <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1 max-w-sm mx-auto">
          No pending tasks found for this view. Enjoy the moment or capture a new work item.
        </p>
        <button
          onClick={onOpenQuickAdd}
          className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 text-xs font-semibold shadow-xs hover:opacity-90 active:scale-95 transition-all"
        >
          <Plus className="w-4 h-4" />
          Add First Task
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-2.5">
      {tasks.map((task, index) => (
        <TaskCard
          key={task.id}
          task={task}
          index={index}
          draggable={true}
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
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
  );
};
