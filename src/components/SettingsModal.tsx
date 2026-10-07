import React, { useState, useRef } from "react";
import { AppSettings, ReminderOffset } from "../types/task";
import {
  requestNotificationPermission,
  getNotificationPermissionState,
} from "../utils/notifications";
import {
  X,
  Sun,
  Moon,
  Laptop,
  Bell,
  Volume2,
  Download,
  Upload,
  RotateCcw,
  Trash2,
  FolderPlus,
  Check,
} from "lucide-react";

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: AppSettings;
  onUpdateSettings: (newSettings: Partial<AppSettings>) => void;
  onExportJSON: () => void;
  onImportJSON: (jsonData: unknown) => void;
  onClearCompleted: () => void;
  onResetToDemo: () => void;
  onTestAlarm?: () => void;
  onRunSystemOnCheck?: () => void;
  onConfirmAction: (action: {
    title: string;
    message: string;
    confirmLabel: string;
    onConfirm: () => void;
  }) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onUpdateSettings,
  onExportJSON,
  onImportJSON,
  onClearCompleted,
  onResetToDemo,
  onTestAlarm,
  onRunSystemOnCheck,
  onConfirmAction,
}) => {
  const [activeTab, setActiveTab] = useState<"appearance" | "notifications" | "data" | "categories">("appearance");
  const [newCatName, setNewCatName] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const notifState = getNotificationPermissionState();

  if (!isOpen) return null;

  const handleRequestPermission = async () => {
    const perm = await requestNotificationPermission();
    if (perm === "granted") {
      onUpdateSettings({ notificationsEnabled: true });
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        onConfirmAction({
          title: "Import Task Database",
          message: "This will restore and merge or replace tasks in your workspace. Are you sure you want to proceed?",
          confirmLabel: "Restore Data",
          onConfirm: () => onImportJSON(parsed),
        });
      } catch (err) {
        alert("Failed to read JSON file: " + (err instanceof Error ? err.message : "Invalid JSON"));
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  const handleAddCategory = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = newCatName.trim();
    if (!clean || settings.categories.includes(clean)) return;

    onUpdateSettings({
      categories: [...settings.categories, clean],
    });
    setNewCatName("");
  };

  const handleRemoveCategory = (catToRemove: string) => {
    if (settings.categories.length <= 1) return;
    onUpdateSettings({
      categories: settings.categories.filter((c) => c !== catToRemove),
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/40 dark:bg-black/60 backdrop-blur-xl">
      <div
        id="settings-modal"
        className="w-full max-w-xl bg-white/95 dark:bg-[#1C1C1E]/95 backdrop-blur-2xl rounded-3xl border border-black/[0.08] dark:border-white/[0.1] shadow-[0_24px_60px_rgba(0,0,0,0.18)] dark:shadow-[0_24px_60px_rgba(0,0,0,0.6)] overflow-hidden flex flex-col max-h-[85vh] transition-all"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-black/[0.05] dark:border-white/[0.08]">
          <div className="flex items-center gap-2.5">
            <span className="w-2 h-2 rounded-full bg-[#1C1C1F] dark:bg-white inline-block shadow-xs" />
            <h2 className="text-[17px] font-semibold tracking-tight text-[#1D1D1F] dark:text-[#F5F5F7]">
              Preferences
            </h2>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full flex items-center justify-center text-[#86868B] hover:text-[#1D1D1F] dark:hover:text-white hover:bg-black/[0.05] dark:hover:bg-white/[0.1] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Navigation (Apple Segmented Bar) */}
        <div className="px-6 pt-3 pb-2 border-b border-black/[0.05] dark:border-white/[0.08]">
          <div className="flex p-0.5 rounded-full bg-black/[0.04] dark:bg-white/[0.06] border border-black/[0.03] dark:border-white/[0.04]">
            {(
              [
                { id: "appearance", label: "Appearance" },
                { id: "notifications", label: "Notifications" },
                { id: "data", label: "Data & Backup" },
                { id: "categories", label: "Categories" },
              ] as const
            ).map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 py-1.5 rounded-full text-xs font-medium transition-all text-center cursor-pointer ${
                  activeTab === tab.id
                    ? "bg-white dark:bg-[#2C2C2E] text-[#1D1D1F] dark:text-white shadow-[0_1px_3px_rgba(0,0,0,0.1),0_1px_2px_rgba(0,0,0,0.06)] font-semibold"
                    : "text-[#86868B] hover:text-[#1D1D1F] dark:hover:text-white"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Contents */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1">
          {/* TAB 1: APPEARANCE */}
          {activeTab === "appearance" && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-[#1D1D1F] dark:text-[#F5F5F7] mb-2">
                  Theme Appearance
                </label>
                <div className="grid grid-cols-3 gap-3">
                  <button
                    type="button"
                    onClick={() => onUpdateSettings({ theme: "light" })}
                    className={`p-3.5 rounded-2xl border flex flex-col items-center gap-2 text-xs font-medium transition-all cursor-pointer ${
                      settings.theme === "light"
                        ? "border-[#0071E3] bg-[#0071E3]/5 text-[#0071E3] font-semibold ring-2 ring-[#0071E3]/20 shadow-xs"
                        : "border-black/[0.06] dark:border-white/[0.08] bg-black/[0.02] dark:bg-white/[0.04] text-[#1D1D1F] dark:text-[#F5F5F7] hover:border-black/[0.12]"
                    }`}
                  >
                    <Sun className="w-5 h-5 text-[#FF9500]" />
                    <span>Light Mode</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => onUpdateSettings({ theme: "dark" })}
                    className={`p-3.5 rounded-2xl border flex flex-col items-center gap-2 text-xs font-medium transition-all cursor-pointer ${
                      settings.theme === "dark"
                        ? "border-[#0071E3] dark:border-[#0A84FF] bg-[#0071E3]/5 dark:bg-[#0A84FF]/10 text-[#0071E3] dark:text-[#0A84FF] font-semibold ring-2 ring-[#0A84FF]/25 shadow-xs"
                        : "border-black/[0.06] dark:border-white/[0.08] bg-black/[0.02] dark:bg-white/[0.04] text-[#1D1D1F] dark:text-[#F5F5F7] hover:border-white/[0.15]"
                    }`}
                  >
                    <Moon className="w-5 h-5 text-[#5E5CE6]" />
                    <span>Dark Mode</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => onUpdateSettings({ theme: "system" })}
                    className={`p-3.5 rounded-2xl border flex flex-col items-center gap-2 text-xs font-medium transition-all cursor-pointer ${
                      settings.theme === "system"
                        ? "border-[#0071E3] dark:border-[#0A84FF] bg-[#0071E3]/5 dark:bg-[#0A84FF]/10 text-[#0071E3] dark:text-[#0A84FF] font-semibold ring-2 ring-[#0071E3]/20 shadow-xs"
                        : "border-black/[0.06] dark:border-white/[0.08] bg-black/[0.02] dark:bg-white/[0.04] text-[#1D1D1F] dark:text-[#F5F5F7] hover:border-black/[0.12]"
                    }`}
                  >
                    <Laptop className="w-5 h-5 text-[#86868B]" />
                    <span>System Auto</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: NOTIFICATIONS */}
          {activeTab === "notifications" && (
            <div className="space-y-3.5">
              {/* Browser notification permission */}
              <div className="p-4 bg-black/[0.02] dark:bg-white/[0.04] rounded-2xl border border-black/[0.04] dark:border-white/[0.06] flex items-center justify-between">
                <div className="space-y-0.5">
                  <span className="text-xs font-medium text-[#1D1D1F] dark:text-[#F5F5F7] flex items-center gap-2">
                    <Bell className="w-4 h-4 text-[#FF9500]" />
                    Desktop Notifications
                  </span>
                  <p className="text-[11px] text-[#86868B]">
                    {notifState === "granted"
                      ? "Browser notifications are granted and active."
                      : notifState === "denied"
                      ? "Browser notifications were blocked. Please enable them in browser settings."
                      : "Request browser permission for system toast notifications."}
                  </p>
                </div>
                {notifState !== "granted" ? (
                  <button
                    onClick={handleRequestPermission}
                    className="px-3.5 py-1.5 rounded-full bg-[#0071E3] text-white text-xs font-medium shadow-xs hover:bg-[#0077ED] transition-all cursor-pointer"
                  >
                    Enable
                  </button>
                ) : (
                  <span className="inline-flex items-center gap-1 text-[11px] font-medium text-[#34C759]">
                    <Check className="w-3.5 h-3.5" />
                    Active
                  </span>
                )}
              </div>

              {/* Default reminder offset */}
              <div className="flex items-center justify-between p-4 bg-black/[0.02] dark:bg-white/[0.04] rounded-2xl border border-black/[0.04] dark:border-white/[0.06]">
                <div className="space-y-0.5">
                  <span className="text-xs font-medium text-[#1D1D1F] dark:text-[#F5F5F7]">
                    Default Reminder Timing
                  </span>
                  <p className="text-[11px] text-[#86868B]">
                    When turning on task reminders by default
                  </p>
                </div>
                <select
                  value={settings.defaultReminderOffset}
                  onChange={(e) =>
                    onUpdateSettings({ defaultReminderOffset: e.target.value as ReminderOffset })
                  }
                  className="px-3 py-1.5 text-xs bg-white dark:bg-[#2C2C2E] border border-black/[0.06] dark:border-white/[0.08] rounded-xl text-[#1D1D1F] dark:text-white focus:outline-none cursor-pointer"
                >
                  <option value="at_time">At scheduled time</option>
                  <option value="5m">5 minutes before</option>
                  <option value="10m">10 minutes before</option>
                  <option value="15m">15 minutes before</option>
                  <option value="30m">30 minutes before</option>
                  <option value="1h">1 hour before</option>
                </select>
              </div>

              {/* Sound toggle */}
              <div className="flex items-center justify-between p-4 bg-black/[0.02] dark:bg-white/[0.04] rounded-2xl border border-black/[0.04] dark:border-white/[0.06]">
                <div className="space-y-0.5">
                  <span className="text-xs font-medium text-[#1D1D1F] dark:text-[#F5F5F7] flex items-center gap-2">
                    <Volume2 className="w-4 h-4 text-[#0071E3]" />
                    Audio Chimes & Alarms
                  </span>
                  <p className="text-[11px] text-[#86868B]">
                    Audible electronic alarms for due tasks and system startup checks
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => onUpdateSettings({ soundEnabled: !settings.soundEnabled })}
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full transition-colors duration-200 ease-in-out p-0.5 ${
                    settings.soundEnabled ? "bg-[#34C759]" : "bg-black/20 dark:bg-white/20"
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md transition duration-200 ease-in-out ${
                      settings.soundEnabled ? "translate-x-5" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>

              {/* Action Buttons: Test Alarm & System ON Audit */}
              <div className="pt-1 grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {onTestAlarm && (
                  <button
                    type="button"
                    onClick={onTestAlarm}
                    className="p-3 rounded-2xl border border-black/[0.05] dark:border-white/[0.08] hover:bg-black/[0.03] dark:hover:bg-white/[0.06] flex items-center gap-3 text-left transition-colors cursor-pointer"
                  >
                    <span className="w-8 h-8 rounded-full bg-[#FF9500]/15 text-[#FF9500] flex items-center justify-center shrink-0">
                      <Bell className="w-4 h-4" />
                    </span>
                    <div>
                      <span className="text-xs font-medium text-[#1D1D1F] dark:text-[#F5F5F7] block">
                        Test Alarm Chime
                      </span>
                      <span className="text-[11px] text-[#86868B]">
                        Plays audio alarm
                      </span>
                    </div>
                  </button>
                )}

                {onRunSystemOnCheck && (
                  <button
                    type="button"
                    onClick={onRunSystemOnCheck}
                    className="p-3 rounded-2xl border border-black/[0.05] dark:border-white/[0.08] hover:bg-black/[0.03] dark:hover:bg-white/[0.06] flex items-center gap-3 text-left transition-colors cursor-pointer"
                  >
                    <span className="w-8 h-8 rounded-full bg-[#0071E3]/15 text-[#0071E3] flex items-center justify-center shrink-0">
                      <RotateCcw className="w-4 h-4" />
                    </span>
                    <div>
                      <span className="text-xs font-medium text-[#1D1D1F] dark:text-[#F5F5F7] block">
                        Run Startup Audit
                      </span>
                      <span className="text-[11px] text-[#86868B]">
                        Scan overdue & today
                      </span>
                    </div>
                  </button>
                )}
              </div>
            </div>
          )}

          {/* TAB 3: DATA & BACKUP */}
          {activeTab === "data" && (
            <div className="space-y-3">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileUpload}
                accept=".json,application/json"
                className="hidden"
              />

              {/* Export JSON */}
              <div className="p-4 bg-black/[0.02] dark:bg-white/[0.04] rounded-2xl border border-black/[0.04] dark:border-white/[0.06] flex items-center justify-between">
                <div>
                  <span className="text-xs font-medium text-[#1D1D1F] dark:text-[#F5F5F7] flex items-center gap-2">
                    <Download className="w-4 h-4 text-[#0071E3]" />
                    Export / Backup JSON
                  </span>
                  <p className="text-[11px] text-[#86868B]">
                    Download snapshot of your full task database
                  </p>
                </div>
                <button
                  onClick={onExportJSON}
                  className="px-3.5 py-1.5 rounded-full bg-[#0071E3] text-white text-xs font-medium shadow-xs hover:bg-[#0077ED] transition-all cursor-pointer"
                >
                  Export
                </button>
              </div>

              {/* Import JSON */}
              <div className="p-4 bg-black/[0.02] dark:bg-white/[0.04] rounded-2xl border border-black/[0.04] dark:border-white/[0.06] flex items-center justify-between">
                <div>
                  <span className="text-xs font-medium text-[#1D1D1F] dark:text-[#F5F5F7] flex items-center gap-2">
                    <Upload className="w-4 h-4 text-[#FF9500]" />
                    Restore Backup
                  </span>
                  <p className="text-[11px] text-[#86868B]">
                    Upload a previously exported .json file
                  </p>
                </div>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="px-3.5 py-1.5 rounded-full border border-black/[0.08] dark:border-white/[0.12] hover:bg-black/[0.04] dark:hover:bg-white/[0.06] text-[#1D1D1F] dark:text-[#F5F5F7] text-xs font-medium transition-all cursor-pointer"
                >
                  Select File...
                </button>
              </div>

              {/* Clear Completed */}
              <div className="p-4 bg-black/[0.02] dark:bg-white/[0.04] rounded-2xl border border-black/[0.04] dark:border-white/[0.06] flex items-center justify-between">
                <div>
                  <span className="text-xs font-medium text-[#1D1D1F] dark:text-[#F5F5F7] flex items-center gap-2">
                    <Trash2 className="w-4 h-4 text-[#FF3B30]" />
                    Clear Completed Tasks
                  </span>
                  <p className="text-[11px] text-[#86868B]">
                    Remove finished items to declutter list
                  </p>
                </div>
                <button
                  onClick={() =>
                    onConfirmAction({
                      title: "Clear Completed Tasks?",
                      message: "This will remove all tasks marked as completed. Active tasks will remain untouched.",
                      confirmLabel: "Clear Completed",
                      onConfirm: onClearCompleted,
                    })
                  }
                  className="px-3.5 py-1.5 rounded-full text-[#FF3B30] hover:bg-[#FF3B30]/10 text-xs font-medium transition-all cursor-pointer"
                >
                  Clear Done
                </button>
              </div>

              {/* Reset to Demo Data */}
              <div className="p-4 bg-black/[0.02] dark:bg-white/[0.04] rounded-2xl border border-black/[0.04] dark:border-white/[0.06] flex items-center justify-between">
                <div>
                  <span className="text-xs font-medium text-[#1D1D1F] dark:text-[#F5F5F7] flex items-center gap-2">
                    <RotateCcw className="w-4 h-4 text-[#5E5CE6]" />
                    Reset to Demo Tasks
                  </span>
                  <p className="text-[11px] text-[#86868B]">
                    Restore the 12 official sample office tasks
                  </p>
                </div>
                <button
                  onClick={() =>
                    onConfirmAction({
                      title: "Reset Sample Demo Tasks?",
                      message: "This will replace current tasks with the initial 12 office demo tasks.",
                      confirmLabel: "Reset to Demo",
                      onConfirm: onResetToDemo,
                    })
                  }
                  className="px-3.5 py-1.5 rounded-full border border-black/[0.08] dark:border-white/[0.12] hover:bg-black/[0.04] dark:hover:bg-white/[0.06] text-[#1D1D1F] dark:text-[#F5F5F7] text-xs font-medium transition-all cursor-pointer"
                >
                  Load Demo
                </button>
              </div>
            </div>
          )}

          {/* TAB 4: CATEGORIES */}
          {activeTab === "categories" && (
            <div className="space-y-4">
              <form onSubmit={handleAddCategory} className="flex gap-2">
                <input
                  type="text"
                  value={newCatName}
                  onChange={(e) => setNewCatName(e.target.value)}
                  placeholder="New category name..."
                  className="flex-1 px-3.5 py-2 text-xs bg-black/[0.03] dark:bg-white/[0.06] border border-black/[0.04] dark:border-white/[0.06] rounded-xl text-[#1D1D1F] dark:text-white placeholder-[#86868B] focus:outline-none focus:ring-2 focus:ring-[#0071E3]/25"
                />
                <button
                  type="submit"
                  disabled={!newCatName.trim()}
                  className="px-4 py-2 text-xs font-semibold bg-[#0071E3] hover:bg-[#0077ED] text-white rounded-xl disabled:opacity-40 transition-all cursor-pointer"
                >
                  <FolderPlus className="w-4 h-4" />
                </button>
              </form>

              <div className="flex flex-wrap gap-2 pt-1">
                {settings.categories.map((cat) => (
                  <span
                    key={cat}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white dark:bg-[#2C2C2E] text-xs font-medium text-[#1D1D1F] dark:text-[#F5F5F7] border border-black/[0.06] dark:border-white/[0.08] shadow-2xs"
                  >
                    {cat}
                    {settings.categories.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveCategory(cat)}
                        className="text-[#86868B] hover:text-[#FF3B30] ml-1 transition-colors cursor-pointer"
                        title="Delete category"
                      >
                        ×
                      </button>
                    )}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-black/[0.05] dark:border-white/[0.08] flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 text-xs font-bold bg-[#1C1C1F] hover:bg-[#2C2C30] dark:bg-white dark:hover:bg-gray-100 text-white dark:text-[#1C1C1F] rounded-xl shadow-xs transition-all cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
