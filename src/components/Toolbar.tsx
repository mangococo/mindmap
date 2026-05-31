import React from 'react';
import { FolderOpen, Save, Moon, Sun, History, Trash2, Plus } from 'lucide-react';

interface ToolbarProps {
  onOpen: () => void;
  onSave: () => void;
  onNew: () => void;
  onHistory: () => void;
  onClear: () => void;
  isDarkMode: boolean;
  onToggleTheme: () => void;
}

export const Toolbar: React.FC<ToolbarProps> = ({
  onOpen,
  onSave,
  onNew,
  onHistory,
  onClear,
  isDarkMode,
  onToggleTheme,
}) => {
  return (
    <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-white/95 dark:bg-gray-800/95 backdrop-blur-md border border-gray-200 dark:border-gray-700 shadow-lg hover:shadow-xl rounded-2xl px-5 py-3.5 flex items-center gap-5 z-50 transition-all duration-300">
      <div className="flex items-center gap-2">
        <ToolButton
          onClick={onNew}
          icon={<Plus size={20} />}
          label="新建"
          primary
        />
        <ToolButton
          onClick={onOpen}
          icon={<FolderOpen size={20} />}
          label="打开"
        />
        <ToolButton
          onClick={onSave}
          icon={<Save size={20} />}
          label="保存"
        />
      </div>

      <Divider />

      <ToolButton
        onClick={onHistory}
        icon={<History size={20} />}
        label="历史记录"
      />

      <ToolButton
        onClick={onClear}
        icon={<Trash2 size={20} />}
        label="清空"
        danger
      />

      <Divider />

      <button
        onClick={onToggleTheme}
        className="p-2.5 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
        title={isDarkMode ? "切换到浅色模式" : "切换到深色模式"}
      >
        {isDarkMode ? <Sun size={22} /> : <Moon size={22} />}
      </button>
    </div>
  );
};

const Divider = () => (
  <div className="w-px h-6 bg-gray-200 dark:bg-gray-700" />
);

interface ToolButtonProps {
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
  primary?: boolean;
  danger?: boolean;
}

const ToolButton: React.FC<ToolButtonProps> = ({ onClick, icon, label, primary, danger }) => {
  let baseClasses = "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200";
  let colorClasses = "";

  if (primary) {
    colorClasses = "bg-blue-50 text-blue-600 hover:bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400 dark:hover:bg-blue-900/50";
  } else if (danger) {
    colorClasses = "text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/30";
  } else {
    colorClasses = "text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700";
  }

  return (
    <button onClick={onClick} className={`${baseClasses} ${colorClasses}`} title={label}>
      {icon}
      <span className="hidden sm:inline">{label}</span>
    </button>
  );
};
