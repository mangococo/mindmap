import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Trash2,
  StickyNote,
  Image as ImageIcon,
  Palette,
  Square,
  Layers,
  GitBranch,
  X,
} from 'lucide-react';
import type { MindMapNode, NodeStyle } from '../lib/types';

interface ContextToolbarProps {
  node: MindMapNode;
  position: { x: number; y: number };
  onUpdateStyle: (id: string, style: NodeStyle) => void;
  onUpdateData: (id: string, data: Partial<MindMapNode>) => void;
  onDelete: (id: string) => void;
  onUpdateBranchColor?: (branchId: string, color: string) => void;
  onClose?: () => void;
}

const COLORS = [
  { bg: '#3B82F6', text: '#FFFFFF', name: '蓝色' },
  { bg: '#EF4444', text: '#FFFFFF', name: '红色' },
  { bg: '#10B981', text: '#FFFFFF', name: '绿色' },
  { bg: '#F59E0B', text: '#FFFFFF', name: '橙色' },
  { bg: '#8B5CF6', text: '#FFFFFF', name: '紫色' },
  { bg: '#06B6D4', text: '#FFFFFF', name: '青色' },
  { bg: '#FFFFFF', text: '#1F2937', name: '白色' },
  { bg: '#F3F4F6', text: '#1F2937', name: '浅灰' },
];

const BRANCH_COLORS = [
  '#3B82F6', '#60A5FA', '#10B981', '#34D399',
  '#F59E0B', '#FBBF24', '#8B5CF6', '#A78BFA',
  '#EF4444', '#F87171', '#06B6D4', '#22D3EE',
];

export const ContextToolbar: React.FC<ContextToolbarProps> = ({
  node,
  position,
  onUpdateStyle,
  onUpdateData,
  onDelete,
  onUpdateBranchColor,
  onClose,
}) => {
  const [activePanel, setActivePanel] = useState<'color' | 'branch' | 'border' | 'note' | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const currentShowBorder = node.style?.showBorder ?? false;
  const currentBorderStyle = node.style?.borderStyle || 'rectangle';

  const handleColorChange = (bg: string, text: string) => {
    onUpdateStyle(node.id, { ...node.style, background: bg, color: text });
    setActivePanel(null);
  };

  const handleBranchColorChange = (color: string) => {
    const branchId = node.branchId || node.id;
    onUpdateBranchColor?.(branchId, color);
    setActivePanel(null);
  };

  const handleToggleBorder = () => {
    onUpdateStyle(node.id, { ...node.style, showBorder: !currentShowBorder });
  };

  const handleBorderStyleChange = (borderStyle: 'rectangle' | 'rounded' | 'capsule') => {
    onUpdateStyle(node.id, { ...node.style, borderStyle });
    setActivePanel(null);
  };

  const handleNoteSave = (note: string) => {
    onUpdateData(node.id, { note });
  };

  const handleImageUpload = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      const img = new Image();
      img.onload = () => {
        const maxSize = 200;
        let width = img.width;
        let height = img.height;
        if (width > maxSize || height > maxSize) {
          const ratio = Math.min(maxSize / width, maxSize / height);
          width *= ratio;
          height *= ratio;
        }
        onUpdateData(node.id, { image: base64, imageSize: { width, height } });
      };
      img.src = base64;
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const togglePanel = (panel: 'color' | 'branch' | 'border' | 'note') => {
    setActivePanel(activePanel === panel ? null : panel);
  };

  return (
    <motion.div
      className="fixed z-[100] flex flex-col gap-2 pointer-events-auto"
      style={{ left: position.x, top: position.y }}
      initial={{ opacity: 0, y: 8, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 8, scale: 0.9 }}
      transition={{ type: 'spring', stiffness: 400, damping: 25, mass: 0.8 }}
      onMouseDown={(e) => e.stopPropagation()}
      onWheel={(e) => e.stopPropagation()}
    >
      {/* Main toolbar */}
      <div
        className="flex items-center gap-1 px-2 py-1.5 rounded-2xl shadow-xl"
        style={{
          background: 'var(--mm-toolbar-bg)',
          backdropFilter: 'blur(12px)',
          border: '1px solid var(--mm-node-border)',
        }}
      >
        <ToolBtn onClick={() => togglePanel('color')} icon={<Palette size={20} />} tooltip="颜色" active={activePanel === 'color'} />
        <ToolBtn onClick={() => togglePanel('branch')} icon={<GitBranch size={20} />} tooltip="分支颜色" active={activePanel === 'branch'} />
        <Sep />
        <ToolBtn onClick={handleToggleBorder} icon={<Square size={20} />} tooltip={currentShowBorder ? '隐藏边框' : '显示边框'} active={currentShowBorder} />
        <ToolBtn onClick={() => togglePanel('border')} icon={<Layers size={20} />} tooltip="边框样式" active={activePanel === 'border'} />
        <Sep />
        <ToolBtn onClick={() => togglePanel('note')} icon={<StickyNote size={20} />} tooltip="备注" active={activePanel === 'note' || !!node.note} />
        <ToolBtn onClick={handleImageUpload} icon={<ImageIcon size={20} />} tooltip="图片" active={!!node.image} />
        <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
        <Sep />
        <ToolBtn onClick={() => onDelete(node.id)} icon={<Trash2 size={20} />} tooltip="删除" danger />
        {onClose && (
          <ToolBtn onClick={onClose} icon={<X size={14} />} tooltip="关闭" />
        )}
      </div>

      {/* Panels */}
      <AnimatePresence>
        {activePanel === 'color' && (
          <Panel key="color">
            {COLORS.map(c => (
              <button key={c.name}
                className="w-7 h-7 rounded-full border-2 hover:scale-110 transition-transform cursor-pointer"
                style={{ backgroundColor: c.bg, borderColor: 'var(--mm-node-border)' }}
                title={c.name}
                onClick={() => handleColorChange(c.bg, c.text)}
              />
            ))}
          </Panel>
        )}

        {activePanel === 'branch' && (
          <Panel key="branch">
            {BRANCH_COLORS.map((c, i) => (
              <button key={c}
                className="w-7 h-7 rounded-full border-2 hover:scale-110 transition-transform cursor-pointer"
                style={{ backgroundColor: c, borderColor: 'var(--mm-node-border)' }}
                title={`颜色 ${i + 1}`}
                onClick={() => handleBranchColorChange(c)}
              />
            ))}
          </Panel>
        )}

        {activePanel === 'border' && (
          <Panel key="border">
            {(['rectangle', 'rounded', 'capsule'] as const).map(style => (
              <button key={style}
                onClick={() => handleBorderStyleChange(style)}
                className={`px-3 py-2 rounded-lg text-xs transition-colors ${
                  currentBorderStyle === style
                    ? 'text-blue-400'
                    : 'hover:bg-white/10'
                }`}
                title={style === 'rectangle' ? '矩形' : style === 'rounded' ? '圆角' : '胶囊'}
              >
                <div className={`w-6 h-4 border-2 border-current ${
                  style === 'rounded' ? 'rounded' : style === 'capsule' ? 'rounded-full' : ''
                }`} />
              </button>
            ))}
          </Panel>
        )}

        {activePanel === 'note' && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            className="p-3 rounded-xl shadow-xl w-64"
            style={{
              background: 'var(--mm-toolbar-bg)',
              backdropFilter: 'blur(12px)',
              border: '1px solid var(--mm-node-border)',
            }}
          >
            <textarea
              className="w-full h-24 p-2 text-sm rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500/50"
              style={{ background: 'transparent', color: 'var(--mm-node-text)', border: '1px solid var(--mm-node-border)' }}
              placeholder="输入节点备注..."
              defaultValue={node.note || ''}
              autoFocus
              onBlur={(e) => handleNoteSave(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && e.metaKey) handleNoteSave(e.currentTarget.value);
              }}
            />
            <div className="text-xs mt-1 opacity-50">Cmd+Enter 保存</div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

const Panel: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <motion.div
    initial={{ opacity: 0, y: -4 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -4 }}
    className="p-2.5 rounded-xl shadow-xl flex gap-1.5 flex-wrap max-w-xs"
    style={{
      background: 'var(--mm-toolbar-bg)',
      backdropFilter: 'blur(12px)',
      border: '1px solid var(--mm-node-border)',
    }}
  >
    {children}
  </motion.div>
);

const Sep = () => (
  <div className="w-px h-5 mx-1 pointer-events-none" style={{ background: 'var(--mm-node-border)' }} />
);

const ToolBtn = ({ onClick, icon, tooltip, danger, active }: {
  onClick: () => void;
  icon: React.ReactNode;
  tooltip: string;
  danger?: boolean;
  active?: boolean;
}) => (
  <button
    onClick={(e) => { e.stopPropagation(); onClick(); }}
    className={`p-2 rounded-lg transition-colors ${
      danger ? 'text-red-400 hover:bg-red-500/20' :
      active ? 'text-blue-400 bg-blue-500/20' :
      'hover:bg-white/10'
    }`}
    style={{ color: danger ? undefined : active ? undefined : 'var(--mm-node-text)' }}
    title={tooltip}
  >
    {icon}
  </button>
);
