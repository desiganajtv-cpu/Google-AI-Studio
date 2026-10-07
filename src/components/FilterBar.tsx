import React from "react";
import { FilterType, SortOption } from "../types/task";
import { Search, X, SlidersHorizontal, ArrowUpDown } from "lucide-react";

interface FilterBarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  activeFilter: FilterType;
  onFilterChange: (filter: FilterType) => void;
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
  categories: string[];
  sortOption: SortOption;
  onSortChange: (sort: SortOption) => void;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  searchQuery,
  onSearchChange,
  activeFilter,
  onFilterChange,
  selectedCategory,
  onCategoryChange,
  categories,
  sortOption,
  onSortChange,
}) => {
  const filterTabs: { id: FilterType; label: string }[] = [
    { id: "all", label: "All" },
    { id: "today", label: "Today" },
    { id: "urgent", label: "Urgent" },
    { id: "overdue", label: "Overdue" },
    { id: "pending", label: "Pending" },
    { id: "in_progress", label: "In Progress" },
    { id: "waiting", label: "Waiting" },
    { id: "completed", label: "Completed" },
  ];

  return (
    <div className="space-y-3">
      {/* Top row: Search, Category, Sort */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            id="input-global-search"
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search tasks, notes, categories, tags..."
            className="w-full pl-9 pr-8 py-2 text-xs sm:text-sm bg-white dark:bg-[#151922] border border-neutral-200/90 dark:border-neutral-800/90 rounded-xl focus:outline-none focus:ring-1 focus:ring-neutral-400 dark:focus:ring-neutral-600 text-neutral-900 dark:text-white placeholder-neutral-400 dark:placeholder-neutral-500 transition-colors"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Category selector */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="relative">
            <select
              id="select-category-filter"
              value={selectedCategory}
              onChange={(e) => onCategoryChange(e.target.value)}
              className="appearance-none text-xs font-medium pl-3 pr-7 py-2 bg-white dark:bg-[#151922] border border-neutral-200/90 dark:border-neutral-800/90 rounded-xl text-neutral-700 dark:text-neutral-300 focus:outline-none focus:ring-1 focus:ring-neutral-400 cursor-pointer"
            >
              <option value="all">All Categories</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
            <SlidersHorizontal className="w-3 h-3 text-neutral-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* Sort selector */}
          <div className="relative">
            <select
              id="select-sort-option"
              value={sortOption}
              onChange={(e) => onSortChange(e.target.value as SortOption)}
              className="appearance-none text-xs font-medium pl-3 pr-7 py-2 bg-white dark:bg-[#151922] border border-neutral-200/90 dark:border-neutral-800/90 rounded-xl text-neutral-700 dark:text-neutral-300 focus:outline-none focus:ring-1 focus:ring-neutral-400 cursor-pointer"
            >
              <option value="smart">Sort: Actionable (Default)</option>
              <option value="priority">Sort: Priority</option>
              <option value="time_asc">Sort: Time (Earliest First)</option>
              <option value="time_desc">Sort: Time (Latest First)</option>
              <option value="created_desc">Sort: Recently Added</option>
              <option value="alpha_asc">Sort: Alphabetical</option>
              <option value="manual">Sort: Manual Order</option>
            </select>
            <ArrowUpDown className="w-3 h-3 text-neutral-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Filter Tabs / Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        {filterTabs.map((tab) => {
          const isActive = activeFilter === tab.id;
          return (
            <button
              key={tab.id}
              id={`filter-tab-${tab.id}`}
              onClick={() => onFilterChange(tab.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all cursor-pointer ${
                isActive
                  ? "bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 font-semibold shadow-2xs"
                  : "bg-white dark:bg-[#151922] text-neutral-600 dark:text-neutral-400 border border-neutral-200/70 dark:border-neutral-800 hover:text-neutral-900 dark:hover:text-white hover:border-neutral-300"
              }`}
            >
              {tab.label}
            </button>
          );
        })}

        {/* Clear filter button if active */}
        {(activeFilter !== "all" || selectedCategory !== "all" || searchQuery) && (
          <button
            onClick={() => {
              onFilterChange("all");
              onCategoryChange("all");
              onSearchChange("");
            }}
            className="text-xs text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200 underline ml-2 whitespace-nowrap"
          >
            Reset filters
          </button>
        )}
      </div>
    </div>
  );
};
