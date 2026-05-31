import { useCallback } from 'react';
import { Handle, Position } from '@xyflow/react';

interface NodeHandlesProps {
  hasChildren: boolean;
  expanded: boolean;
  isSelected: boolean;
  onToggleExpand: () => void;
  onAddChild: () => void;
}

export function NodeHandles({
  hasChildren,
  expanded,
  isSelected,
  onToggleExpand,
  onAddChild,
}: NodeHandlesProps) {
  const handleToggleClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      onToggleExpand();
    },
    [onToggleExpand],
  );

  const handleAddClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      onAddChild();
    },
    [onAddChild],
  );

  return (
    <>
      {/* Invisible target handle — we don't use manual connections */}
      <Handle
        type="target"
        position={Position.Left}
        style={{ opacity: 0 }}
      />

      {/* Invisible source handle */}
      <Handle
        type="source"
        position={Position.Right}
        style={{ opacity: 0 }}
      />

      {/* Expand/collapse button — only when selected and has children */}
      {isSelected && hasChildren && (
        <button
          onClick={handleToggleClick}
          className={`
            absolute -right-3 top-1/2 -translate-y-1/2
            w-5 h-5 rounded-full flex items-center justify-center
            text-white text-xs cursor-pointer border-none shadow-sm
            transition-transform hover:scale-110
            ${expanded ? 'bg-red-500' : 'bg-green-500'}
          `}
          title={expanded ? '收起子节点' : '展开子节点'}
        >
          {expanded ? '−' : '+'}
        </button>
      )}

      {/* Add child button — only when selected */}
      {isSelected && (
        <button
          onClick={handleAddClick}
          className="
            absolute -right-3 top-0
            w-5 h-5 rounded-full flex items-center justify-center
            bg-blue-500 text-white text-xs cursor-pointer border-none shadow-sm
            transition-transform hover:scale-110
          "
          title="添加子节点"
        >
          +
        </button>
      )}
    </>
  );
}
