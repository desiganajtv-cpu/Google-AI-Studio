import React from "react";
import { FilterType } from "../types/task";
import { Calendar, AlertCircle, AlertTriangle, CheckCircle2 } from "lucide-react";

interface SummaryCardsProps {
  counts: {
    today: number;
    urgent: number;
    overdue: number;
    completed: number;
  };
  activeFilter: FilterType;
  onSelectFilter: (filter: FilterType) => void;
}

export const SummaryCards: React.FC<SummaryCardsProps> = ({
  counts,
  activeFilter,
  onSelectFilter,
}) => {
  const cards = [
    {
      id: "summary-card-today",
      filter: "today" as FilterType,
      label: "Today",
      count: counts.today,
      icon: Calendar,
      accentText: "text-neutral-900 dark:text-white",
      activeBg: "border-neutral-900 dark:border-white bg-white dark:bg-neutral-800 shadow-xs",
      indicator: "bg-blue-500",
    },
    {
      id: "summary-card-urgent",
      filter: "urgent" as FilterType,
      label: "Urgent",
      count: counts.urgent,
      icon: AlertCircle,
      accentText: "text-rose-600 dark:text-rose-400",
      activeBg: "border-rose-500 dark:border-rose-400 bg-rose-50/50 dark:bg-rose-950/30 shadow-xs",
      indicator: "bg-rose-500",
    },
    {
      id: "summary-card-overdue",
      filter: "overdue" as FilterType,
      label: "Overdue",
      count: counts.overdue,
      icon: AlertTriangle,
      accentText: "text-amber-600 dark:text-amber-400",
      activeBg: "border-amber-500 dark:border-amber-400 bg-amber-50/50 dark:bg-amber-950/30 shadow-xs",
      indicator: "bg-amber-500",
    },
    {
      id: "summary-card-completed",
      filter: "completed" as FilterType,
      label: "Completed",
      count: counts.completed,
      icon: CheckCircle2,
      accentText: "text-emerald-600 dark:text-emerald-400",
      activeBg: "border-emerald-500 dark:border-emerald-400 bg-emerald-50/50 dark:bg-emerald-950/30 shadow-xs",
      indicator: "bg-emerald-500",
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3">
      {cards.map((card) => {
        const Icon = card.icon;
        const isActive = activeFilter === card.filter;

        return (
          <button
            key={card.filter}
            id={card.id}
            onClick={() => onSelectFilter(isActive ? "all" : card.filter)}
            className={`flex flex-col text-left p-3 sm:p-3.5 rounded-xl border transition-all duration-150 cursor-pointer ${
              isActive
                ? card.activeBg
                : "bg-white dark:bg-[#151922] border-neutral-200/80 dark:border-neutral-800/80 hover:border-neutral-300 dark:hover:border-neutral-700"
            }`}
          >
            <div className="flex items-center justify-between w-full mb-1">
              <span className="text-xs font-medium text-neutral-500 dark:text-neutral-400">
                {card.label}
              </span>
              <Icon className={`w-3.5 h-3.5 ${card.accentText} opacity-80`} />
            </div>
            <div className="flex items-baseline justify-between mt-0.5">
              <span className={`text-2xl font-bold tracking-tight ${card.accentText}`}>
                {card.count}
              </span>
              {isActive && (
                <span className="text-[10px] uppercase font-semibold text-neutral-400 dark:text-neutral-500">
                  Filtered
                </span>
              )}
            </div>
          </button>
        );
      })}
    </div>
  );
};
