import React, { useState, useCallback, useRef, useEffect } from 'react';
import type { MindMapData, MindMapNode } from '../lib/types';
import { ContextToolbar } from './ContextToolbar';
import { useMindMapStore } from '../store/mindmapStore';

const DEFAULT_BRANCH_COLORS = [
  '#3B82F6',
  '#10B981',
  '#F59E0B',
  '#8B5CF6',
  '#EF4444',
  '#06B6D4',
  '#EC4899',
  '#14B8A6',
];

interface MindMapEditorProps {
  data: MindMapData;
  onNodeClick?: (node: MindMapNode) => void;
  onAddChild?: (parentId: string, newNodeId?: string) => void;
  onUpdateNode?: (id: string, text: string) => void;
  onUpdateNodeData?: (id: string, data: Partial<MindMapNode>) => void;
  onDeleteNode?: (id: string) => void;
  onToggleNodeExpanded?: (id: string) => void;
  onUpdateBranchColor?: (branchId: string, color: string) => void;
}

interface TreeNode extends MindMapNode {
  x: number;
  y: number;
  width: number;
  height: number;
  level: number;
  hasChildren: boolean;
}

const MindNode = React.memo(({
  node,
  isSelected,
  onClick,
  onAddChild,
  onUpdate,
  onToggleExpanded,
  shouldAutoEdit,
  onEditComplete,
  onDragStart
}: {
  node: TreeNode;
  isSelected: boolean;
  onClick: (e: React.MouseEvent, node: MindMapNode) => void;
  onAddChild: (id: string) => void;
  onUpdate: (id: string, text: string) => void;
  onToggleExpanded: (id: string) => void;
  onEditComplete: (id: string) => void;
  shouldAutoEdit: boolean;
  onDragStart?: (e: React.MouseEvent, node: TreeNode) => void;
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setText] = useState(node.text);
  const inputRef = useRef<HTMLInputElement>(null);

  const isRoot = node.level === 0;
  const hasChildren = node.hasChildren;

  useEffect(() => {
    if (shouldAutoEdit && !isEditing) {
      setIsEditing(true);
      setText('新节点');
    }
  }, [shouldAutoEdit]);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleDoubleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setIsEditing(true);
  };

  const handleBlur = () => {
    setIsEditing(false);
    if (editText !== node.text) {
      onUpdate(node.id, editText);
    }
    onEditComplete(node.id);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleBlur();
    }
  };

  const handleAddClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onAddChild(node.id);
  };

  const handleToggleExpanded = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    onToggleExpanded(node.id);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return; // 只处理左键

    e.stopPropagation();
    onClick(e, node);

    if (onDragStart) {
      onDragStart(e, node);
    }
  };

  const nodeStyle = node.style || {};
  const bgColor = nodeStyle.background || (isRoot ? '#3B82F6' : '#FFFFFF');
  const textColor = nodeStyle.color || (isRoot ? '#FFFFFF' : '#1F2937');

  const showBorder = nodeStyle.showBorder !== undefined ? nodeStyle.showBorder : isRoot;
  const borderStyle = nodeStyle.borderStyle || (isRoot ? 'rounded' : 'rectangle');

  let borderRadius = 0;
  if (borderStyle === 'rounded') {
    borderRadius = 8;
  } else if (borderStyle === 'capsule') {
    borderRadius = node.height / 2;
  }

  const hasImage = node.image !== undefined;
  const thumbnailWidth = 80;
  const thumbnailHeight = 80;

  return (
    <g
      data-node-id={node.id}
      transform={`translate(${node.x}, ${node.y})`}
      onMouseEnter={(e) => {
        e.stopPropagation();
        setIsHovered(true);
      }}
      onMouseLeave={(e) => {
        e.stopPropagation();
        setIsHovered(false);
      }}
      onMouseDown={handleMouseDown}
      onDoubleClick={handleDoubleClick}
      className="cursor-pointer"
    >
      {showBorder && (
        <rect
          x={-node.width / 2}
          y={-node.height / 2}
          width={node.width}
          height={node.height}
          rx={borderRadius}
          ry={borderRadius}
          filter="url(#shadow)"
          fill={bgColor}
          stroke={isSelected ? '#3B82F6' : 'none'}
          strokeWidth={isSelected ? 3 : 0}
          className="transition-all duration-200"
        />
      )}

      {hasImage && !isEditing ? (
        isEditing ? (
          <foreignObject
            x={-node.width / 2}
            y={-node.height / 2}
            width={node.width}
            height={node.height}
          >
            <div className="w-full h-full flex items-center justify-center">
              <input
                ref={inputRef}
                value={editText}
                onChange={(e) => setText(e.target.value)}
                onBlur={handleBlur}
                onKeyDown={handleKeyDown}
                className="w-full text-center bg-transparent border-none outline-none p-0 m-0"
                style={{
                  color: textColor,
                  fontSize: isRoot ? 16 : 14,
                  fontFamily: 'inherit'
                }}
              />
            </div>
          </foreignObject>
        ) : (
          <foreignObject
            x={-thumbnailWidth / 2}
            y={-thumbnailHeight / 2}
            width={thumbnailWidth}
            height={thumbnailHeight}
          >
            <img
              src={node.image}
              alt={node.text}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                borderRadius: showBorder ? `${borderRadius}px` : '0px',
                border: isSelected ? '3px solid #3B82F6' : 'none',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            />
          </foreignObject>
        )
      ) : (
        <>
          {isEditing ? (
            <foreignObject
              x={-node.width / 2}
              y={-node.height / 2}
              width={node.width}
              height={node.height}
            >
              <div className="w-full h-full flex items-center justify-center">
                <input
                  ref={inputRef}
                  value={editText}
                  onChange={(e) => setText(e.target.value)}
                  onBlur={handleBlur}
                  onKeyDown={handleKeyDown}
                  className="w-full text-center bg-transparent border-none outline-none p-0 m-0"
                  style={{
                    color: textColor,
                    fontSize: isRoot ? 20 : 16,
                    fontWeight: isRoot ? '700' : '400',
                    fontFamily: '"Noto Sans CJK SC", "Source Han Sans SC", "Microsoft YaHei", "PingFang SC", sans-serif'
                  }}
                />
              </div>
            </foreignObject>
          ) : (
            <g>
              <rect
                x={-node.width / 2}
                y={-node.height / 2}
                width={node.width}
                height={node.height}
                fill="transparent"
                stroke={isSelected ? '#3B82F6' : 'transparent'}
                strokeWidth={isSelected ? 2 : 0}
                className="cursor-pointer transition-all duration-200"
              />
              <text
                textAnchor="middle"
                dominantBaseline="middle"
                fill={textColor}
                pointerEvents="none"
                style={{
                  fontSize: isRoot ? 20 : 16,
                  fontWeight: isRoot ? '700' : '400',
                  fontFamily: '"Noto Sans CJK SC", "Source Han Sans SC", "Microsoft YaHei", "PingFang SC", sans-serif'
                }}
              >
                {node.text}
              </text>

              {!isRoot && (
                <g transform={`translate(${node.width/2}, ${-node.height/2 + 6})`}>
                  {node.note && <circle r="3" fill="#F59E0B" cx="-6" />}
                </g>
              )}
            </g>
          )}
        </>
      )}

      {!isEditing && (
        <>
          <rect
            x={node.width / 2}
            y={-node.height / 2}
            width={30}
            height={node.height}
            fill="transparent"
            className="hover-trigger"
          />

          {isSelected && hasChildren && (
            <g
              transform={`translate(${node.width / 2 + 12}, -18)`}
              onClick={(e) => {
                e.stopPropagation();
                handleToggleExpanded(e);
              }}
              className="cursor-pointer"
            >
              <circle r="10" fill={node.expanded ? "#EF4444" : "#10B981"} className="shadow-sm hover:scale-110 transition-transform" />
              <path d="M-4 0 H4" stroke="white" strokeWidth="2" strokeLinecap="round" />
            </g>
          )}

          {isSelected && (
            <g
              transform={`translate(${node.width / 2 + 12}, 0)`}
              onClick={(e) => {
                e.stopPropagation();
                handleAddClick(e);
              }}
              className="cursor-pointer"
            >
              <circle r="10" fill="#3B82F6" className="shadow-sm hover:scale-110 transition-transform" />
              <path d="M-4 0 H4 M0 -4 V4" stroke="white" strokeWidth="2" strokeLinecap="round" />
            </g>
          )}

          {isHovered && !isSelected && hasChildren && (
            <g
              transform={`translate(${node.width / 2 + 12}, 0)`}
              onMouseDown={(e) => {
                e.stopPropagation();
                handleToggleExpanded(e);
              }}
              className="cursor-pointer"
            >
              <circle r="10" fill={node.expanded ? "#EF4444" : "#10B981"} className="shadow-sm hover:scale-110 transition-transform" />
              {node.expanded ? (
                <path d="M-4 0 H4" stroke="white" strokeWidth="2" strokeLinecap="round" />
              ) : (
                <path d="M-4 0 H4 M0 -4 V4" stroke="white" strokeWidth="2" strokeLinecap="round" />
              )}
            </g>
          )}
        </>
      )}
    </g>
  );
});

export const MindMapEditor: React.FC<MindMapEditorProps> = ({
  data,
  onNodeClick,
  onAddChild,
  onUpdateNode,
  onUpdateNodeData,
  onDeleteNode,
  onToggleNodeExpanded,
  onUpdateBranchColor,
}) => {
  const [nodes, setNodes] = useState<TreeNode[]>([]);
  const [edges, setEdges] = useState<{ from: string; to: string; x1: number; y1: number; x2: number; y2: number; color?: string }[]>([]);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [autoEditNodeId, setAutoEditNodeId] = useState<string | null>(null);
  const [scale, setScale] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [mindMapOffset, setMindMapOffset] = useState({ x: 0, y: 0 });
  const [draggingNodeId, setDraggingNodeId] = useState<string | null>(null);
  const [dragType, setDragType] = useState<'canvas' | 'root' | 'child' | null>(null);
  const [dragTargetIndex, setDragTargetIndex] = useState<number | null>(null);
  const [dragTargetY, setDragTargetY] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedNode = nodes.find(n => n.id === selectedNodeId);
  
  const toolbarPosition = selectedNode ? {
    x: selectedNode.x * scale + offset.x,
    y: (selectedNode.y - selectedNode.height/2) * scale + offset.y
  } : null;

  const layoutNodes = useCallback((root: MindMapNode): TreeNode[] => {
    const result: TreeNode[] = [];
    const edgeList: { from: string; to: string; x1: number; y1: number; x2: number; y2: number; color?: string }[] = [];

    const calculateSize = (node: MindMapNode, level: number): { width: number; height: number; totalHeight: number } => {
      const fontSize = level === 0 ? 18 : 14;

      if (node.image) {
        return {
          width: 80,
          height: 80,
          totalHeight: 80
        };
      }

      const paddingX = level === 0 ? 32 : 16;
      const textWidth = Math.max(node.text.length * (fontSize * 0.7), 40);
      const width = textWidth + paddingX * 2;
      const height = level === 0 ? 60 : 24;

      const childrenHeight = node.children && node.children.length > 0
        ? node.children.reduce((sum, child) => sum + calculateSize(child, level + 1).totalHeight, 0) + (node.children.length - 1) * 20
        : height;

      return { width, height, totalHeight: Math.max(height, childrenHeight) };
    };

    const layoutNode = (
      node: MindMapNode,
      x: number,
      y: number,
      level: number
    ): TreeNode => {
      const { width, height, totalHeight } = calculateSize(node, level);

      const treeNode: TreeNode = {
        ...node,
        x: x + mindMapOffset.x,
        y: y + mindMapOffset.y,
        width,
        height,
        level,
        hasChildren: !!(node.children && node.children.length > 0),
      };

      result.push(treeNode);

      if (node.children && node.children.length > 0 && node.expanded !== false) {
        let currentY = y - totalHeight / 2;
        const startX = x + width + 80;

        node.children.forEach((child, index) => {
          const childSize = calculateSize(child, level + 1);
          const childHeight = childSize.totalHeight;
          const childY = currentY + childHeight / 2;

          const childNode = layoutNode(child, startX, childY, level + 1);

          const edgeColor = child.style?.branchStyle?.lineColor ||
            node.style?.branchStyle?.lineColor ||
            (level === 0 ? DEFAULT_BRANCH_COLORS[index % DEFAULT_BRANCH_COLORS.length] : undefined);

          edgeList.push({
            from: node.id,
            to: child.id,
            x1: x + mindMapOffset.x + width / 2,
            y1: y + mindMapOffset.y,
            x2: childNode.x - childNode.width / 2,
            y2: childNode.y,
            color: edgeColor,
          });

          currentY += childHeight + 20;
        });
      }

      return treeNode;
    };

    const viewportWidth = containerRef.current?.clientWidth || window.innerWidth;
    const viewportHeight = containerRef.current?.clientHeight || window.innerHeight;
    
    if (offset.x === 0 && offset.y === 0) {
      setOffset({ x: viewportWidth / 2 - 100, y: viewportHeight / 2 });
    }

    layoutNode(root, 0, 0, 0);
    setEdges(edgeList);
    return result;
  }, [offset, mindMapOffset]);

  useEffect(() => {
    if (data && data.root) {
      const treeNodes = layoutNodes(data.root);
      setNodes(treeNodes);
    }
  }, [data, layoutNodes]);

  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Tab' && selectedNodeId) {
        e.preventDefault();
        if (onAddChild) {
          const newNodeId = `new-${Date.now()}`;
          onAddChild(selectedNodeId, newNodeId);
          setSelectedNodeId(newNodeId);
          setAutoEditNodeId(newNodeId);
        }
      }

      if ((e.key === 'Delete' || e.key === 'Backspace') && selectedNodeId) {
        if (document.activeElement?.tagName !== 'INPUT' && document.activeElement?.tagName !== 'TEXTAREA') {
          e.preventDefault();
          if (onDeleteNode) onDeleteNode(selectedNodeId);
        }
      }
    };

    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, [selectedNodeId, onAddChild, onDeleteNode]);

  useEffect(() => {
    const handlePaste = async (e: ClipboardEvent) => {
      if (!selectedNodeId || !onUpdateNodeData) return;

      const items = e.clipboardData?.items;
      if (!items) return;

      for (const item of items) {
        if (item.type.startsWith('image/')) {
          e.preventDefault();
          const file = item.getAsFile();
          if (!file) return;

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

              onUpdateNodeData(selectedNodeId, { image: base64, imageSize: { width, height } });
            };
            img.src = base64;
          };
          reader.readAsDataURL(file);
          break;
        }
      }
    };

    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, [selectedNodeId, onUpdateNodeData]);

  useEffect(() => {
    const handlePaste = async (e: ClipboardEvent) => {
      if (!selectedNodeId || !onUpdateNodeData) return;

      const items = e.clipboardData?.items;
      if (!items) return;

      for (const item of items) {
        if (item.type.startsWith('image/')) {
          e.preventDefault();
          const file = item.getAsFile();
          if (!file) return;

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

              onUpdateNodeData(selectedNodeId, { image: base64, imageSize: { width, height } });
            };
            img.src = base64;
          };
          reader.readAsDataURL(file);
          break;
        }
      }
    };

    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, [selectedNodeId, onUpdateNodeData]);

  const handleNodeClick = useCallback((e: React.MouseEvent, node: MindMapNode) => {
    e.stopPropagation();
    setSelectedNodeId(node.id);
    if (onNodeClick) {
      onNodeClick(node);
    }
  }, [onNodeClick]);

  const handleEditComplete = useCallback((nodeId: string) => {
    if (autoEditNodeId === nodeId) {
      setAutoEditNodeId(null);
    }
  }, [autoEditNodeId]);

  const handleNodeDragStart = useCallback((e: React.MouseEvent, node: TreeNode) => {
    e.preventDefault();
    setIsDragging(true);
    setDraggingNodeId(node.id);
    setDragStart({ x: e.clientX, y: e.clientY });

    if (node.level === 0) {
      setDragType('root');
    } else {
      setDragType('child');
    }
  }, []);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    const target = e.target as Element;

    if (draggingNodeId) {
      return;
    }

    const isInsideSVG = containerRef.current?.contains(target);
    const isNodeClick = target.closest('[data-node-id]');

    if (isInsideSVG && !isNodeClick) {
      e.preventDefault();
      setIsDragging(true);
      setDragType('canvas');
      setDragStart({ x: e.clientX - offset.x, y: e.clientY - offset.y });
      setSelectedNodeId(null);
    }
  }, [offset, draggingNodeId]);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging) return;

    if (dragType === 'canvas') {
      setOffset({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      });
    } else if (dragType === 'root') {
      const deltaX = (e.clientX - dragStart.x) / scale;
      const deltaY = (e.clientY - dragStart.y) / scale;
      setMindMapOffset({
        x: deltaX,
        y: deltaY,
      });
    } else if (dragType === 'child' && draggingNodeId) {
      // 子节点拖动 - 找到目标位置
      const draggingNode = nodes.find(n => n.id === draggingNodeId);
      if (!draggingNode || draggingNode.level === 0) return;

      // 获取所有同级节点
      const siblings = nodes.filter(n => n.level === draggingNode.level);
      if (siblings.length <= 1) return;

      // 将鼠标坐标转换为 SVG 坐标
      const mouseX = (e.clientX - offset.x) / scale;
      const mouseY = (e.clientY - offset.y) / scale;

      // 找到最接近的节点
      let closestNode = siblings[0];
      let minDistance = Infinity;

      siblings.forEach(node => {
        if (node.id === draggingNodeId) return;

        const dx = node.x - mouseX;
        const dy = node.y - mouseY;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < minDistance) {
          minDistance = distance;
          closestNode = node;
        }
      });

      // 计算应该插入的位置
      const draggingIndex = siblings.findIndex(n => n.id === draggingNodeId);
      const targetIndex = siblings.findIndex(n => n.id === closestNode.id);

      // 判断是在目标节点之前还是之后
      const insertBefore = mouseY < closestNode.y;
      let newIndex = insertBefore ? targetIndex : targetIndex + 1;

      // 如果拖动节点在目标节点之后,需要调整索引
      if (draggingIndex < newIndex) {
        newIndex = Math.max(0, newIndex - 1);
      }

      if (newIndex !== dragTargetIndex && newIndex !== draggingIndex) {
        setDragTargetIndex(newIndex);

        // 计算目标位置的 Y 坐标
        const targetNode = siblings[newIndex] || siblings[siblings.length - 1];
        if (targetNode) {
          const offsetY = insertBefore ? -targetNode.height / 2 - 10 : targetNode.height / 2 + 10;
          setDragTargetY(targetNode.y + offsetY);
        }
      }
    }
  }, [isDragging, dragType, dragStart, scale, draggingNodeId, nodes, offset, dragTargetIndex]);

  const handleMouseUp = useCallback(() => {
    if (dragType === 'root' && mindMapOffset.x !== 0 && mindMapOffset.y !== 0) {
      // root 节点拖动结束时,更新 offset 并重置 mindMapOffset
      setOffset(prev => ({
        x: prev.x + mindMapOffset.x * scale,
        y: prev.y + mindMapOffset.y * scale,
      }));
      setMindMapOffset({ x: 0, y: 0 });
    } else if (dragType === 'child' && draggingNodeId && dragTargetIndex !== null) {
      // 子节点拖动结束时,执行重排序
      const draggingNode = nodes.find(n => n.id === draggingNodeId);
      if (draggingNode && draggingNode.level > 0) {
        const siblings = nodes.filter(n => n.level === draggingNode.level);
        const currentIndex = siblings.findIndex(n => n.id === draggingNodeId);

        if (currentIndex !== dragTargetIndex) {
          // 在 store 中实际执行重排序
          const store = useMindMapStore.getState();
          store.reorderNode(draggingNodeId, dragTargetIndex);
        }
      }
      setDragTargetIndex(null);
      setDragTargetY(null);
    }

    setIsDragging(false);
    setDraggingNodeId(null);
    setDragType(null);
  }, [dragType, mindMapOffset, scale, draggingNodeId, dragTargetIndex, nodes, onUpdateNodeData]);

  const handleWheel = useCallback((e: WheelEvent) => {
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault();
      const delta = e.deltaY > 0 ? 0.9 : 1.1;
      setScale(prev => Math.max(0.1, Math.min(3, prev * delta)));
    } else if (e.shiftKey) {
      e.preventDefault();
      setOffset(prev => ({
        x: prev.x - e.deltaY,
        y: prev.y,
      }));
    } else {
      e.preventDefault();
      setOffset(prev => ({
        x: prev.x - e.deltaX,
        y: prev.y - e.deltaY,
      }));
    }
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    if (container) {
      container.addEventListener('wheel', handleWheel, { passive: false });
    }
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    return () => {
      if (container) {
        container.removeEventListener('wheel', handleWheel);
      }
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [handleMouseMove, handleMouseUp, handleWheel]);

  const BackgroundPattern = () => (
    <pattern id="dot-pattern" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
      <circle cx="2" cy="2" r="1" className="text-gray-300 dark:text-gray-700" fill="currentColor" />
    </pattern>
  );

  return (
    <div
      ref={containerRef}
      className="w-full h-full overflow-hidden bg-gray-50 dark:bg-gray-900 relative select-none"
      onMouseDown={handleMouseDown}
      style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
    >
      {selectedNode && toolbarPosition && (
        <ContextToolbar
          node={selectedNode}
          position={toolbarPosition}
          onUpdateStyle={(id, style) => onUpdateNodeData?.(id, { style })}
          onUpdateData={(id, data) => onUpdateNodeData?.(id, data)}
          onDelete={(id) => onDeleteNode?.(id)}
          onUpdateBranchColor={(branchId, color) => onUpdateBranchColor?.(branchId, color)}
        />
      )}

      <svg width="100%" height="100%" className="block">
        <defs>
          <BackgroundPattern />
          <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="rgba(0,0,0,0.1)" />
          </filter>
        </defs>

        {/* 背景图案 - 只随 offset 平移，不随 scale 缩放 */}
        <g
          style={{
            transform: `translate(${offset.x}px, ${offset.y}px)`,
            transformOrigin: '0 0',
          }}
        >
          <rect
            x={-offset.x}
            y={-offset.y}
            width="20000"
            height="20000"
            fill="url(#dot-pattern)"
          />
        </g>

        {/* 节点和连线 - 同时随 offset 平移和 scale 缩放 */}
        <g
          style={{
            transform: `translate(${offset.x}px, ${offset.y}px) scale(${scale})`,
            transformOrigin: '0 0',
            transition: isDragging ? 'none' : 'transform 0.1s ease-out',
          }}
        >
          {edges.map((edge, index) => {
            const deltaX = edge.x2 - edge.x1;
            const cp1x = edge.x1 + deltaX * 0.5;
            const cp2x = edge.x2 - deltaX * 0.5;
            const strokeColor = edge.color || 'currentColor';
            return (
              <path
                key={`edge-${index}`}
                d={`M ${edge.x1} ${edge.y1} C ${cp1x} ${edge.y1}, ${cp2x} ${edge.y2}, ${edge.x2} ${edge.y2}`}
                stroke={strokeColor}
                strokeWidth={3}
                fill="none"
                strokeLinecap="round"
                className={edge.color ? '' : 'stroke-gray-300 dark:stroke-gray-600'}
              />
            );
          })}

          {dragType === 'child' && dragTargetY !== null && (
            <line
              x1={nodes.filter(n => n.level === 1)[0]?.x - 100 || -200}
              y1={dragTargetY}
              x2={nodes.filter(n => n.level === 1)[0]?.x + 200 || 200}
              y2={dragTargetY}
              stroke="#3B82F6"
              strokeWidth={2}
              strokeDasharray="5,5"
              className="opacity-50"
            />
          )}

          {nodes.map((node) => (
            <MindNode
              key={node.id}
              node={node}
              isSelected={selectedNodeId === node.id}
              onClick={handleNodeClick}
              onAddChild={(id) => {
                const newNodeId = `new-${Date.now()}`;
                if (onAddChild) {
                  onAddChild(id, newNodeId);
                  setSelectedNodeId(newNodeId);
                  setAutoEditNodeId(newNodeId);
                }
              }}
              onUpdate={(id, text) => onUpdateNode && onUpdateNode(id, text)}
              onToggleExpanded={(id) => onToggleNodeExpanded && onToggleNodeExpanded(id)}
              onEditComplete={handleEditComplete}
              shouldAutoEdit={node.id === autoEditNodeId}
              onDragStart={handleNodeDragStart}
            />
          ))}
        </g>
      </svg>

      <div className="absolute bottom-6 left-6 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm px-4 py-2 rounded-full shadow-lg border border-gray-200 dark:border-gray-700 text-sm font-medium text-gray-600 dark:text-gray-300 flex items-center gap-2">
        <span>{Math.round(scale * 100)}%</span>
        <div className="w-px h-3 bg-gray-300 dark:bg-gray-600 mx-1" />
        <button onClick={() => { setScale(1); setOffset({ x: window.innerWidth / 2 - 100, y: window.innerHeight / 2 }); }} className="hover:text-blue-500">重置</button>
      </div>
    </div>
  );
};
