import { useCallback } from 'react';
import { Handle, Position } from '@xyflow/react';

interface NodeHandlesProps {
  hasChildren: boolean;
  expanded: boolean;
  isSelected: boolean;
  direction?: 1 | -1;
  onToggleExpand: () => void;
  onAddChild: () => void;
}

export function NodeHandles({
  hasChildren,
  expanded,
  isSelected,
  direction,
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

  const isLeft = direction === -1;

  return (
    <>
      {/* Target handles on all 4 sides — edges pick via targetHandle */}
      <Handle type="target" position={Position.Right} id="target-right" style={{ opacity: 0 }} />
      <Handle type="target" position={Position.Left} id="target-left" style={{ opacity: 0 }} />
      <Handle type="target" position={Position.Top} id="target-top" style={{ opacity: 0 }} />
      <Handle type="target" position={Position.Bottom} id="target-bottom" style={{ opacity: 0 }} />

      {/* Source handles on all 4 sides — edges pick via sourceHandle */}
      <Handle type="source" position={Position.Right} id="source-right" style={{ opacity: 0 }} />
      <Handle type="source" position={Position.Left} id="source-left" style={{ opacity: 0 }} />
      <Handle type="source" position={Position.Top} id="source-top" style={{ opacity: 0 }} />
      <Handle type="source" position={Position.Bottom} id="source-bottom" style={{ opacity: 0 }} />

      {/* Expand/collapse button — only when selected and has children */}
      {isSelected && hasChildren && (
        <button
          onClick={handleToggleClick}
          className={`
            absolute ${isLeft ? '-left-3' : '-right-3'} top-1/2 -translate-y-1/2
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
          className={`
            absolute ${isLeft ? '-left-3' : '-right-3'} top-0
            w-5 h-5 rounded-full flex items-center justify-center
            bg-blue-500 text-white text-xs cursor-pointer border-none shadow-sm
            transition-transform hover:scale-110
          `}
          title="添加子节点"
        >
          +
        </button>
      )}
    </>
  );
}
