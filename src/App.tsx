import { useState, useCallback } from "react";
import { useTasks } from "./hooks/useTasks";
import { Task } from "./types/task";
import { Workspace } from "./components/Workspace";
import { NotificationBanner } from "./components/NotificationBanner";
import { ActiveAlarmModal } from "./components/ActiveAlarmModal";
import { SystemOnAlertModal } from "./components/SystemOnAlertModal";
import { TaskModal } from "./components/TaskModal";
import { SettingsModal } from "./components/SettingsModal";
import { ConfirmDialog } from "./components/ConfirmDialog";
import { ToastNotification } from "./components/ToastNotification";

export default function App() {
  const {
    tasks,
    toasts,
    removeToast,
    addTask,
    updateTask,
    deleteTask,
    toggleComplete,
    clearCompleted,
    resetToDemoData,
    exportData,
    importData,
    settings,
    updateSettings,
    activeAlarmTask,
    dismissAlarm,
    snoozeAlarm,
    systemOnAlert,
    setSystemOnAlert,
    runSystemOnCheck,
    rescheduleAllOverdueToToday,
    reorderTaskById,
    moveTaskToPosition,
    moveTaskDelta,
    permissionState,
    enableDesktopNotifications,
    testAlarm,
  } = useTasks();

  // Modals state
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);

  // Confirmation dialog state
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    confirmLabel?: string;
    isDestructive?: boolean;
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: "",
    message: "",
    confirmLabel: "Continue",
    isDestructive: true,
    onConfirm: () => {},
  });

  const handleOpenNewTaskModal = useCallback(() => {
    setEditingTask(null);
    setIsTaskModalOpen(true);
  }, []);

  const handleEditTask = useCallback((task: Task) => {
    setEditingTask(task);
    setIsTaskModalOpen(true);
  }, []);

  const handleCycleTheme = useCallback(() => {
    const themes: ("light" | "dark" | "system")[] = ["light", "dark", "system"];
    const nextIdx = (themes.indexOf(settings.theme) + 1) % themes.length;
    updateSettings({ theme: themes[nextIdx] });
  }, [settings.theme, updateSettings]);

  const completedCount = tasks.filter((t) => t.status === "completed").length;

  return (
    <div className="min-h-screen bg-[#DCDCE0] dark:bg-[#141416] text-[#1C1C1F] dark:text-[#F3F3F5] flex flex-col font-sans transition-colors duration-200">
      {/* Consolidated Responsive Workspace */}
      <Workspace
        tasks={tasks}
        settings={settings}
        permissionState={permissionState}
        onAddTask={addTask}
        onUpdateTask={updateTask}
        onToggleComplete={toggleComplete}
        onEditTask={handleEditTask}
        onDeleteTask={deleteTask}
        onReorderTasks={reorderTaskById}
        onMoveTaskToPosition={moveTaskToPosition}
        onMoveTaskDelta={moveTaskDelta}
        onRescheduleOverdueToToday={rescheduleAllOverdueToToday}
        onClearCompleted={clearCompleted}
        onOpenQuickAddModal={handleOpenNewTaskModal}
        onOpenSettings={() => setIsSettingsModalOpen(true)}
        onToggleSound={() => updateSettings({ soundEnabled: !settings.soundEnabled })}
        onCycleTheme={handleCycleTheme}
        onEnableNotifications={enableDesktopNotifications}
      />

      {/* Notification Banner (if desktop notifications not enabled yet) */}
      <NotificationBanner
        notificationsEnabled={settings.notificationsEnabled}
        permissionState={permissionState}
        onEnable={enableDesktopNotifications}
        onTestAlarm={testAlarm}
        soundEnabled={settings.soundEnabled}
      />

      {/* Task Edit/Create Modal */}
      <TaskModal
        isOpen={isTaskModalOpen}
        onClose={() => {
          setIsTaskModalOpen(false);
          setEditingTask(null);
        }}
        initialTask={editingTask}
        onSave={addTask}
        onUpdate={updateTask}
        onDelete={deleteTask}
        categories={settings.categories}
        defaultReminderOffset={settings.defaultReminderOffset}
      />

      {/* Settings & Data Modal */}
      <SettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        settings={settings}
        onUpdateSettings={updateSettings}
        onExportJSON={exportData}
        onImportJSON={importData}
        onClearCompleted={clearCompleted}
        onResetToDemo={resetToDemoData}
        onTestAlarm={testAlarm}
        onRunSystemOnCheck={() => runSystemOnCheck(true)}
        onConfirmAction={({ title, message, confirmLabel, onConfirm }) => {
          setConfirmDialog({
            isOpen: true,
            title,
            message,
            confirmLabel,
            isDestructive: true,
            onConfirm,
          });
        }}
      />

      {/* Active Time-Set Audible Alarm Modal */}
      <ActiveAlarmModal
        task={activeAlarmTask}
        onDismiss={dismissAlarm}
        onComplete={toggleComplete}
        onSnooze={snoozeAlarm}
      />

      {/* System ON / Startup Due Date Alert Modal */}
      <SystemOnAlertModal
        isOpen={!!systemOnAlert && (systemOnAlert.overdueTasks.length > 0 || systemOnAlert.todayTasks.length > 0)}
        overdueTasks={systemOnAlert?.overdueTasks || []}
        todayTasks={systemOnAlert?.todayTasks || []}
        onClose={() => setSystemOnAlert(null)}
        onFocusToday={() => {
          setSystemOnAlert(null);
        }}
        onFilterOverdue={() => {
          setSystemOnAlert(null);
        }}
        onRescheduleOverdueToToday={rescheduleAllOverdueToToday}
        onCompleteTask={toggleComplete}
      />

      {/* Confirmation Dialog */}
      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        title={confirmDialog.title}
        message={confirmDialog.message}
        confirmLabel={confirmDialog.confirmLabel}
        isDestructive={confirmDialog.isDestructive}
        onConfirm={confirmDialog.onConfirm}
        onCancel={() => setConfirmDialog((prev) => ({ ...prev, isOpen: false }))}
      />

      {/* In-App Toast Notifications */}
      <ToastNotification
        toasts={toasts}
        onDismiss={removeToast}
        onSelectTask={(taskId) => {
          const target = tasks.find((t) => t.id === taskId);
          if (target) handleEditTask(target);
        }}
      />
    </div>
  );
}
