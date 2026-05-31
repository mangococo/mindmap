import { useCallback, useEffect, useMemo, useRef } from 'react';
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  BackgroundVariant,
  useNodesState,
  useEdgesState,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import type { MindMapData } from '../lib/types';
import { computeLayout } from '../lib/layout';
import type { LayoutAlgorithm } from '../lib/layout/types';
import { MindMapNode } from './nodes/MindMapNode';
import { AnimatedEdge } from './edges/AnimatedEdge';
import { useMindMapStore } from '../store/mindmapStore';

const nodeTypes = { mindmap: MindMapNode };
const edgeTypes = { bezier: AnimatedEdge };

const defaultEdgeOptions = {
  type: 'bezier' as const,
  animated: false,
};

interface MindMapEditorProps {
  data: MindMapData;
  layoutAlgorithm?: LayoutAlgorithm;
  onNodeClick?: (id: string) => void;
}

export const MindMapEditor: React.FC<MindMapEditorProps> = ({
  data,
  layoutAlgorithm = 'horizontal',
}) => {
  const { updateNode, addChild, deleteNode, toggleNodeExpanded, updateNodeData } = useMindMapStore();
  const selectedNodeId = useRef<string | null>(null);

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

  const onNodeClick = useCallback((_: React.MouseEvent, node: { id: string }) => {
    selectedNodeId.current = node.id;
  }, []);

  const onPaneClick = useCallback(() => {
    selectedNodeId.current = null;
  }, []);

  // Listen for custom DOM events from MindMapNode components
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

      if (e.key === 'Tab' && selectedNodeId.current) {
        e.preventDefault();
        const newNodeId = `new-${Date.now()}`;
        addChild(selectedNodeId.current, newNodeId);
      }
      if ((e.key === 'Delete' || e.key === 'Backspace') && selectedNodeId.current) {
        e.preventDefault();
        deleteNode(selectedNodeId.current);
        selectedNodeId.current = null;
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [addChild, deleteNode]);

  // Image paste
  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      if (!selectedNodeId.current) return;
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
              updateNodeData(selectedNodeId.current!, { image: base64, imageSize: { width: w, height: h } });
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
        onNodeClick={onNodeClick}
        onPaneClick={onPaneClick}
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
        <MiniMap
          nodeColor={() => 'var(--mm-branch-1)'}
          maskColor="rgba(0,0,0,0.1)"
          style={{ background: 'var(--mm-bg)', border: '1px solid var(--mm-node-border)' }}
        />
        <Controls
          showInteractive={false}
          style={{ background: 'var(--mm-toolbar-bg)', border: '1px solid var(--mm-node-border)' }}
        />
      </ReactFlow>
    </div>
  );
};
