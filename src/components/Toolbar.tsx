import React from 'react';
import { FolderOpen, Save, History, Trash2, Plus, LayoutGrid, Palette, Maximize } from 'lucide-react';
import type { LayoutAlgorithm } from '../lib/layout/types';

const THEMES = ['classic', 'ocean', 'forest', 'sunset', 'midnight', 'minimal'] as const;
const THEME_LABELS: Record<string, string> = {
  classic: '经典', ocean: '海洋', forest: '森林',
  sunset: '日落', midnight: '暗夜', minimal: '极简',
};
const LAYOUT_LABELS: Record<LayoutAlgorithm, string> = {
  horizontal: '向右树形',
  radial: '中心放射',
  balanced: '双向对称',
};

interface ToolbarProps {
  onOpen: () => void;
  onSave: () => void;
  onNew: () => void;
  onHistory: () => void;
  onClear: () => void;
  theme: string;
  onCycleTheme: () => void;
  layoutAlgorithm: LayoutAlgorithm;
  onLayoutChange: (layout: LayoutAlgorithm) => void;
  onZenMode?: () => void;
}

export const Toolbar: React.FC<ToolbarProps> = ({
  onOpen, onSave, onNew, onHistory, onClear,
  theme, onCycleTheme,
  layoutAlgorithm, onLayoutChange,
  onZenMode,
}) => {
  const [showLayoutMenu, setShowLayoutMenu] = React.useState(false);
  const [showThemeMenu, setShowThemeMenu] = React.useState(false);

  return (
    <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-50 max-w-[calc(100vw-2rem)]"
      style={{ background: 'var(--mm-toolbar-bg)', backdropFilter: 'blur(12px)', border: '1px solid var(--mm-node-border)' }}
    >
      <div className="flex items-center gap-0.5 sm:gap-1 px-2 sm:px-3 py-2 rounded-2xl shadow-lg overflow-x-auto">
        <ToolButton onClick={onNew} icon={<Plus size={18} />} label="新建" primary />
        <ToolButton onClick={onOpen} icon={<FolderOpen size={18} />} label="打开" />
        <ToolButton onClick={onSave} icon={<Save size={18} />} label="保存" />
        <Divider />
        <div className="relative">
          <ToolButton
            onClick={() => { setShowLayoutMenu(!showLayoutMenu); setShowThemeMenu(false); }}
            icon={<LayoutGrid size={18} />}
            label={LAYOUT_LABELS[layoutAlgorithm]}
          />
          {showLayoutMenu && (
            <div className="absolute top-full mt-2 left-0 p-1 rounded-xl shadow-xl min-w-[140px] z-50"
              style={{ background: 'var(--mm-toolbar-bg)', backdropFilter: 'blur(12px)', border: '1px solid var(--mm-node-border)' }}
            >
              {(Object.keys(LAYOUT_LABELS) as LayoutAlgorithm[]).map(l => (
                <button key={l} onClick={() => { onLayoutChange(l); setShowLayoutMenu(false); }}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm ${layoutAlgorithm === l ? 'bg-blue-500/20 text-blue-400' : 'hover:bg-white/10'}`}
                >
                  {LAYOUT_LABELS[l]}
                </button>
              ))}
            </div>
          )}
        </div>
        <div className="relative">
          <ToolButton
            onClick={() => { setShowThemeMenu(!showThemeMenu); setShowLayoutMenu(false); }}
            icon={<Palette size={18} />}
            label={THEME_LABELS[theme] || '主题'}
          />
          {showThemeMenu && (
            <div className="absolute top-full mt-2 left-0 p-2 rounded-xl shadow-xl flex gap-1.5 z-50"
              style={{ background: 'var(--mm-toolbar-bg)', backdropFilter: 'blur(12px)', border: '1px solid var(--mm-node-border)' }}
            >
              {THEMES.map(t => (
                <button key={t} onClick={() => { onCycleTheme(); setShowThemeMenu(false); }}
                  className={`w-7 h-7 rounded-full border-2 transition-transform hover:scale-110 ${theme === t ? 'border-blue-400 scale-110' : 'border-transparent'}`}
                  style={{ background: `var(--mm-root-bg)` }}
                  title={THEME_LABELS[t]}
                  data-theme-preview={t}
                />
              ))}
            </div>
          )}
        </div>
        <Divider />
        <div className="hidden sm:block">
          <ToolButton onClick={onHistory} icon={<History size={18} />} label="历史" />
        </div>
        <div className="hidden sm:block">
          <ToolButton onClick={onClear} icon={<Trash2 size={18} />} label="清空" danger />
        </div>
        <Divider className="hidden sm:block" />
        {onZenMode && (
          <ToolButton onClick={onZenMode} icon={<Maximize size={18} />} label="沉浸" />
        )}
      </div>
    </div>
  );
};

const Divider = ({ className = '' }: { className?: string }) => (
  <div className={`w-px h-5 mx-1 ${className}`} style={{ background: 'var(--mm-node-border)' }} />
);

interface ToolButtonProps {
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
  primary?: boolean;
  danger?: boolean;
}

const ToolButton: React.FC<ToolButtonProps> = ({ onClick, icon, label, primary, danger }) => (
  <button onClick={onClick}
    className={`flex items-center gap-1.5 px-2 sm:px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 min-h-[36px] ${
      primary ? 'bg-blue-500/20 text-blue-400 hover:bg-blue-500/30' :
      danger ? 'text-red-400 hover:bg-red-500/20' :
      'hover:bg-white/10'
    }`}
    title={label}
  >
    {icon}
    <span className="hidden sm:inline">{label}</span>
  </button>
);
