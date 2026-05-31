import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  BackgroundVariant,
  useNodesState,
  useEdgesState,
  useReactFlow,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { AnimatePresence } from 'framer-motion';

import type { MindMapData, MindMapNode as MindMapNodeType, NodeStyle } from '../lib/types';
import { computeLayout } from '../lib/layout';
import type { LayoutAlgorithm } from '../lib/layout/types';
import { MindMapNode } from './nodes/MindMapNode';
import { AnimatedEdge } from './edges/AnimatedEdge';
import { ContextToolbar } from './ContextToolbar';
import { useMindMapStore } from '../store/mindmapStore';

const nodeTypes = { mindmap: MindMapNode };
const edgeTypes = { bezier: AnimatedEdge };

const defaultEdgeOptions = {
  type: 'bezier' as const,
  animated: false,
};

function findNodeInTree(node: MindMapNodeType, id: string): MindMapNodeType | null {
  if (node.id === id) return node;
  if (node.children) {
    for (const child of node.children) {
      const found = findNodeInTree(child, id);
      if (found) return found;
    }
  }
  return null;
}

interface MindMapEditorProps {
  data: MindMapData;
  layoutAlgorithm?: LayoutAlgorithm;
  zenMode?: boolean;
}

export const MindMapEditor: React.FC<MindMapEditorProps> = ({
  data,
  layoutAlgorithm = 'horizontal',
  zenMode = false,
}) => {
  const { updateNode, addChild, deleteNode, toggleNodeExpanded, updateNodeData, updateBranchColor } = useMindMapStore();
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const selectedNodeIdRef = useRef<string | null>(null);

  const layout = useMemo(
    () => computeLayout(data.root, { algorithm: layoutAlgorithm }),
    [data.root, layoutAlgorithm],
  );

  const [nodes, setNodes, onNodesChange] = useNodesState(layout.nodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(layout.edges);

  useEffect(() => {
    setNodes(layout.nodes);
    setEdges(layout.edges);
  }, [layout, setNodes, setEdges]);

  // Sync ref with state for event handlers
  useEffect(() => {
    selectedNodeIdRef.current = selectedNodeId;
  }, [selectedNodeId]);

  const handleNodeClick = useCallback((_: React.MouseEvent, node: { id: string }) => {
    setSelectedNodeId(node.id);
  }, []);

  const handlePaneClick = useCallback(() => {
    setSelectedNodeId(null);
  }, []);

  const handleNodeDoubleClick = useCallback((_: React.MouseEvent, node: { id: string }) => {
    document.dispatchEvent(
      new CustomEvent('mindmap:edit-node', { detail: { id: node.id } }),
    );
  }, []);

  // DOM events from MindMapNode components
  useEffect(() => {
    const handleUpdateNode = (e: Event) => {
      const { id, text } = (e as CustomEvent).detail;
      updateNode(id, text);
    };
    const handleToggleExpand = (e: Event) => {
      const { id } = (e as CustomEvent).detail;
      toggleNodeExpanded(id);
    };
    const handleAddChild = (e: Event) => {
      const { id } = (e as CustomEvent).detail;
      const newNodeId = `new-${Date.now()}`;
      addChild(id, newNodeId);
    };

    document.addEventListener('mindmap:update-node', handleUpdateNode);
    document.addEventListener('mindmap:toggle-expand', handleToggleExpand);
    document.addEventListener('mindmap:add-child', handleAddChild);
    return () => {
      document.removeEventListener('mindmap:update-node', handleUpdateNode);
      document.removeEventListener('mindmap:toggle-expand', handleToggleExpand);
      document.removeEventListener('mindmap:add-child', handleAddChild);
    };
  }, [updateNode, toggleNodeExpanded, addChild]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const tag = (document.activeElement?.tagName || '').toLowerCase();
      if (tag === 'input' || tag === 'textarea') return;

      const sid = selectedNodeIdRef.current;
      if (e.key === 'Tab' && sid) {
        e.preventDefault();
        const newNodeId = `new-${Date.now()}`;
        addChild(sid, newNodeId);
      }
      if ((e.key === 'Delete' || e.key === 'Backspace') && sid) {
        e.preventDefault();
        deleteNode(sid);
        setSelectedNodeId(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [addChild, deleteNode]);

  // Image paste
  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      if (!selectedNodeIdRef.current) return;
      const items = e.clipboardData?.items;
      if (!items) return;
      for (const item of items) {
        if (item.type.startsWith('image/')) {
          e.preventDefault();
          const file = item.getAsFile();
          if (!file) return;
          const reader = new FileReader();
          reader.onload = (ev) => {
            const base64 = ev.target?.result as string;
            const img = new Image();
            img.onload = () => {
              const maxSize = 200;
              let w = img.width, h = img.height;
              if (w > maxSize || h > maxSize) {
                const ratio = Math.min(maxSize / w, maxSize / h);
                w *= ratio;
                h *= ratio;
              }
              updateNodeData(selectedNodeIdRef.current!, { image: base64, imageSize: { width: w, height: h } });
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
  }, [updateNodeData]);

  return (
    <div className="w-full h-full">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        defaultEdgeOptions={defaultEdgeOptions}
        onNodeClick={handleNodeClick}
        onNodeDoubleClick={handleNodeDoubleClick}
        onPaneClick={handlePaneClick}
        fitView
        fitViewOptions={{ padding: 0.3 }}
        minZoom={0.1}
        maxZoom={3}
        selectNodesOnDrag={false}
        nodesDraggable={false}
        nodesConnectable={false}
        proOptions={{ hideAttribution: true }}
      >
        <Background variant={BackgroundVariant.Dots} gap={20} size={1} color="var(--mm-bg-pattern)" />
        {!zenMode && (
          <>
            <MiniMap
              nodeColor={() => 'var(--mm-branch-1)'}
              maskColor="rgba(0,0,0,0.1)"
              style={{ background: 'var(--mm-bg)', border: '1px solid var(--mm-node-border)' }}
            />
            <Controls
              showInteractive={false}
              style={{ background: 'var(--mm-toolbar-bg)', border: '1px solid var(--mm-node-border)' }}
            />
          </>
        )}
      </ReactFlow>

      {/* ContextToolbar for selected node */}
      <ContextToolbarOverlay
        selectedNodeId={selectedNodeId}
        nodes={nodes}
        dataRoot={data.root}
        onUpdateStyle={(id, style) => {
          const tree = findNodeInTree(data.root, id);
          updateNodeData(id, { style: { ...tree?.style, ...style } });
        }}
        onUpdateData={updateNodeData}
        onDelete={(id) => { deleteNode(id); setSelectedNodeId(null); }}
        onUpdateBranchColor={updateBranchColor}
      />
    </div>
  );
};

interface ContextToolbarOverlayProps {
  selectedNodeId: string | null;
  nodes: any[];
  dataRoot: MindMapNodeType;
  onUpdateStyle: (id: string, style: NodeStyle) => void;
  onUpdateData: (id: string, data: Partial<MindMapNodeType>) => void;
  onDelete: (id: string) => void;
  onUpdateBranchColor: (branchId: string, color: string) => void;
}

const ContextToolbarOverlay: React.FC<ContextToolbarOverlayProps> = ({
  selectedNodeId, nodes, dataRoot,
  onUpdateStyle, onUpdateData, onDelete, onUpdateBranchColor,
}) => {
  const { flowToScreenPosition } = useReactFlow();

  const selectedNode = selectedNodeId
    ? nodes.find(n => n.id === selectedNodeId)
    : null;

  const treeNode = selectedNodeId
    ? findNodeInTree(dataRoot, selectedNodeId)
    : null;

  if (!selectedNode || !treeNode) return null;

  const nodeWidth = (selectedNode as any).measured?.width || (selectedNode as any).width || 120;
  const screenPos = flowToScreenPosition({
    x: selectedNode.position.x + nodeWidth / 2,
    y: selectedNode.position.y,
  });

  return (
    <AnimatePresence>
      <ContextToolbar
        node={treeNode}
        position={{ x: screenPos.x, y: screenPos.y - 50 }}
        onUpdateStyle={onUpdateStyle}
        onUpdateData={onUpdateData}
        onDelete={onDelete}
        onUpdateBranchColor={onUpdateBranchColor}
      />
    </AnimatePresence>
  );
};
