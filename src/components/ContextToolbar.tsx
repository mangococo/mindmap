import React, { useState, useRef } from 'react';
import {
  Trash2,
  StickyNote,
  Image as ImageIcon,
  Palette,
  Square,
  Layers,
  GitBranch,
} from 'lucide-react';
import type { MindMapNode, NodeStyle } from '../lib/types';

interface ContextToolbarProps {
  node: MindMapNode;
  position: { x: number; y: number };
  onUpdateStyle: (id: string, style: NodeStyle) => void;
  onUpdateData: (id: string, data: Partial<MindMapNode>) => void;
  onDelete: (id: string) => void;
  onUpdateBranchColor?: (branchId: string, color: string) => void;
}

export const ContextToolbar: React.FC<ContextToolbarProps> = ({
  node,
  position,
  onUpdateStyle,
  onUpdateData,
  onDelete,
  onUpdateBranchColor,
}) => {
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showBranchColorPicker, setShowBranchColorPicker] = useState(false);
  const [showNoteInput, setShowNoteInput] = useState(false);
  const [showBorderStyleMenu, setShowBorderStyleMenu] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const colors = [
    { bg: '#3B82F6', text: '#FFFFFF', name: '蓝色' },
    { bg: '#EF4444', text: '#FFFFFF', name: '红色' },
    { bg: '#10B981', text: '#FFFFFF', name: '绿色' },
    { bg: '#F59E0B', text: '#FFFFFF', name: '橙色' },
    { bg: '#8B5CF6', text: '#FFFFFF', name: '紫色' },
    { bg: '#06B6D4', text: '#FFFFFF', name: '青色' },
    { bg: '#FFFFFF', text: '#1F2937', name: '白色' },
    { bg: '#F3F4F6', text: '#1F2937', name: '浅灰' },
  ];

  const branchColors = [
    '#3B82F6',
    '#60A5FA',
    '#10B981',
    '#34D399',
    '#F59E0B',
    '#FBBF24',
    '#8B5CF6',
    '#A78BFA',
    '#EF4444',
    '#F87171',
    '#06B6D4',
    '#22D3EE',
  ];

  const handleColorChange = (bg: string, text: string) => {
    onUpdateStyle(node.id, {
      ...node.style,
      background: bg,
      color: text,
    });
    setShowColorPicker(false);
  };

  const handleBranchColorChange = (color: string) => {
    const branchId = node.branchId || node.id;
    onUpdateBranchColor?.(branchId, color);
    setShowBranchColorPicker(false);
  };

  const handleToggleBorder = () => {
    const currentShowBorder = node.style?.showBorder !== undefined ? node.style.showBorder : false;
    onUpdateStyle(node.id, {
      ...node.style,
      showBorder: !currentShowBorder,
    });
  };

  const handleBorderStyleChange = (borderStyle: 'rectangle' | 'rounded' | 'capsule') => {
    onUpdateStyle(node.id, {
      ...node.style,
      borderStyle,
    });
    setShowBorderStyleMenu(false);
  };

  const handleNoteSave = (note: string) => {
    onUpdateData(node.id, { note });
    setShowNoteInput(false);
  };

  const currentShowBorder = node.style?.showBorder !== undefined ? node.style.showBorder : false;
  const currentBorderStyle = node.style?.borderStyle || 'rectangle';

  const handleImageUpload = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('请选择图片文件');
      return;
    }

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
          width = width * ratio;
          height = height * ratio;
        }

        onUpdateData(node.id, { image: base64, imageSize: { width, height } });
      };
      img.src = base64;
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  return (
    <div
      className="fixed z-[100] flex flex-col gap-2 transform -translate-x-1/2 pointer-events-auto"
      style={{ left: position.x, top: position.y - 30 }}
      onMouseDown={(e) => e.stopPropagation()}
      onWheel={(e) => e.stopPropagation()}
    >
      <div className="flex items-center gap-2 p-2 bg-white/95 dark:bg-gray-800/95 backdrop-blur-md rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 animate-in fade-in zoom-in-95 duration-200 pointer-events-auto">
        <ToolbarButton
          onClick={() => setShowColorPicker(!showColorPicker)}
          icon={<Palette size={20} />}
          tooltip="更改颜色"
          active={showColorPicker}
        />
        <ToolbarButton
          onClick={() => setShowBranchColorPicker(!showBranchColorPicker)}
          icon={<GitBranch size={20} />}
          tooltip="分支颜色"
          active={showBranchColorPicker}
        />
        <div className="w-px h-5 bg-gray-200 dark:border-gray-700 mx-1 pointer-events-none" />
        <ToolbarButton
          onClick={handleToggleBorder}
          icon={<Square size={20} />}
          tooltip={currentShowBorder ? "隐藏边框" : "显示边框"}
          active={currentShowBorder}
        />
        <ToolbarButton
          onClick={() => setShowBorderStyleMenu(!showBorderStyleMenu)}
          icon={<Layers size={20} />}
          tooltip="边框样式"
          active={showBorderStyleMenu}
        />
        <div className="w-px h-5 bg-gray-200 dark:border-gray-700 mx-1 pointer-events-none" />
        <ToolbarButton
          onClick={() => setShowNoteInput(!showNoteInput)}
          icon={<StickyNote size={20} />}
          tooltip="添加备注"
          active={showNoteInput || !!node.note}
        />
        <ToolbarButton
          onClick={handleImageUpload}
          icon={<ImageIcon size={20} />}
          tooltip="添加图片"
          active={!!node.image}
        />
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
        />
        <div className="w-px h-5 bg-gray-200 dark:border-gray-700 mx-1 pointer-events-none" />
        <ToolbarButton
          onClick={() => onDelete(node.id)}
          icon={<Trash2 size={20} />}
          tooltip="删除节点"
          danger
        />
      </div>

      {showColorPicker && (
        <div
          className="p-3 bg-white/95 dark:bg-gray-800/95 backdrop-blur-md rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 flex gap-2 pointer-events-auto"
          onWheel={(e) => e.stopPropagation()}
        >
          {colors.map(c => (
            <button
              key={c.name}
              className="w-8 h-8 rounded-full border-2 border-gray-200 dark:border-gray-600 hover:scale-110 transition-transform cursor-pointer"
              style={{ backgroundColor: c.bg }}
              title={c.name}
              onClick={() => handleColorChange(c.bg, c.text)}
            />
          ))}
        </div>
      )}

      {showBranchColorPicker && (
        <div
          className="p-3 bg-white/95 dark:bg-gray-800/95 backdrop-blur-md rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 flex gap-2 pointer-events-auto flex-wrap max-w-xs"
          onWheel={(e) => e.stopPropagation()}
        >
          {branchColors.map((c, index) => (
            <button
              key={c}
              className="w-8 h-8 rounded-full border-2 border-gray-200 dark:border-gray-600 hover:scale-110 transition-transform cursor-pointer"
              style={{ backgroundColor: c }}
              title={`颜色 ${index + 1}`}
              onClick={() => handleBranchColorChange(c)}
            />
          ))}
        </div>
      )}

      {showBorderStyleMenu && (
        <div
          className="p-2 bg-white/95 dark:bg-gray-800/95 backdrop-blur-md rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 flex gap-2 pointer-events-auto"
          onWheel={(e) => e.stopPropagation()}
        >
          <button
            onClick={() => handleBorderStyleChange('rectangle')}
            className={`px-3 py-2 rounded-md text-sm transition-colors ${currentBorderStyle === 'rectangle' ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
            title="矩形"
          >
            <div className="w-6 h-4 border-2 border-current" />
          </button>
          <button
            onClick={() => handleBorderStyleChange('rounded')}
            className={`px-3 py-2 rounded-md text-sm transition-colors ${currentBorderStyle === 'rounded' ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
            title="圆角矩形"
          >
            <div className="w-6 h-4 border-2 border-current rounded" />
          </button>
          <button
            onClick={() => handleBorderStyleChange('capsule')}
            className={`px-3 py-2 rounded-md text-sm transition-colors ${currentBorderStyle === 'capsule' ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
            title="胶囊形"
          >
            <div className="w-6 h-4 border-2 border-current rounded-full" />
          </button>
        </div>
      )}

      {showNoteInput && (
        <div
          className="p-3 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 w-64 pointer-events-auto"
          onWheel={(e) => e.stopPropagation()}
        >
          <textarea
            className="w-full h-24 p-2 text-sm border border-gray-300 dark:border-gray-600 rounded bg-transparent dark:text-white resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="输入节点备注..."
            defaultValue={node.note || ''}
            autoFocus
            onBlur={(e) => handleNoteSave(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && e.metaKey) {
                handleNoteSave(e.currentTarget.value);
              }
            }}
          />
          <div className="text-xs text-gray-400 mt-1 flex justify-between">
            <span>Cmd+Enter 保存</span>
          </div>
        </div>
      )}
    </div>
  );
};

const ToolbarButton = ({ onClick, icon, tooltip, danger, active }: any) => (
  <button
    onClick={(e) => {
      e.stopPropagation();
      onClick();
    }}
    className={`p-2.5 rounded-md transition-colors ${
      danger
        ? 'text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20'
        : active
          ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/30'
          : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
    }`}
    title={tooltip}
  >
    {icon}
  </button>
);
