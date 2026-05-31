import { create } from 'zustand';
import type { MindMapData, MindMapNode } from '../lib/types';
import { generateId } from '../lib/utils';

interface MindMapStore {
  data: MindMapData | null;
  setData: (data: MindMapData) => void;
  updateNode: (id: string, text: string) => void;
  updateNodeData: (id: string, data: Partial<MindMapNode>) => void;
  addChild: (parentId: string, newNodeId?: string) => void;
  deleteNode: (id: string) => void;
  toggleNodeExpanded: (id: string) => void;
  updateBranchColor: (branchId: string, color: string) => void;
  reorderNode: (nodeId: string, targetIndex: number) => void;
  clear: () => void;
}

const createEmptyMindMap = (): MindMapData => ({
  root: {
    id: generateId(),
    text: '中心主题',
    children: [],
    expanded: true,
  },
  meta: {
    title: '未命名思维导图',
    createdAt: new Date().toISOString(),
    modifiedAt: new Date().toISOString(),
  },
});

export const useMindMapStore = create<MindMapStore>((set) => ({
  data: createEmptyMindMap(),

  setData: (data) => set({ data }),

  updateNode: (id: string, text: string) =>
    set((state) => {
      if (!state.data) return state;

      const updateRecursive = (node: MindMapNode): MindMapNode => {
        if (node.id === id) {
          return { ...node, text };
        }
        if (node.children) {
          return {
            ...node,
            children: node.children.map((child) => updateRecursive(child)),
          };
        }
        return node;
      };

      return {
        data: {
          ...state.data,
          root: updateRecursive(state.data.root),
          meta: {
            ...state.data.meta,
            modifiedAt: new Date().toISOString(),
          },
        },
      };
    }),

  updateNodeData: (id: string, nodeData: Partial<MindMapNode>) =>
    set((state) => {
      if (!state.data) return state;

      const updateRecursive = (node: MindMapNode): MindMapNode => {
        if (node.id === id) {
          return { ...node, ...nodeData };
        }
        if (node.children) {
          return {
            ...node,
            children: node.children.map((child) => updateRecursive(child)),
          };
        }
        return node;
      };

      return {
        data: {
          ...state.data,
          root: updateRecursive(state.data.root),
          meta: {
            ...state.data.meta,
            modifiedAt: new Date().toISOString(),
          },
        },
      };
    }),

   addChild: (parentId: string, newNodeId?: string) =>
    set((state) => {
      if (!state.data) return state;

      const DEFAULT_BRANCH_COLORS = [
        '#3B82F6', '#10B981', '#F59E0B', '#8B5CF6', '#EF4444', '#06B6D4', '#EC4899', '#14B8A6',
      ];

      const addChildRecursive = (node: MindMapNode, level: number = 0): MindMapNode => {
        if (node.id === parentId) {
          const branchId = node.branchId || node.id;
          const branchStyle = node.style?.branchStyle;

          let childBranchStyle = branchStyle;
          if (level === 0 && !branchStyle) {
            const childIndex = (node.children?.length || 0);
            childBranchStyle = { lineColor: DEFAULT_BRANCH_COLORS[childIndex % DEFAULT_BRANCH_COLORS.length] };
          }

          const newChild: MindMapNode = {
            id: newNodeId || generateId(),
            text: '新节点',
            children: [],
            expanded: true,
            branchId,
            style: {
              branchStyle: childBranchStyle ? { ...childBranchStyle } : undefined,
            },
          };
          return {
            ...node,
            children: [...(node.children || []), newChild],
            expanded: true,
          };
        }
        if (node.children) {
          return {
            ...node,
            children: node.children.map((child) => addChildRecursive(child, level + 1)),
          };
        }
        return node;
      };

      return {
        data: {
          ...state.data,
          root: addChildRecursive(state.data.root),
          meta: {
            ...state.data.meta,
            modifiedAt: new Date().toISOString(),
          },
        },
      };
    }),

  deleteNode: (id: string) =>
    set((state) => {
      if (!state.data) return state;

      const deleteRecursive = (node: MindMapNode): MindMapNode | null => {
        if (node.id === id) return null;

        if (node.children) {
          const filteredChildren = node.children
            .map((child) => deleteRecursive(child))
            .filter((child): child is MindMapNode => child !== null);

          return {
            ...node,
            children: filteredChildren,
          };
        }

        return node;
      };

      const newRoot = deleteRecursive(state.data.root);

      if (!newRoot) {
        return { data: createEmptyMindMap() };
      }

      return {
        data: {
          ...state.data,
          root: newRoot,
          meta: {
            ...state.data.meta,
            modifiedAt: new Date().toISOString(),
          },
        },
      };
    }),

  toggleNodeExpanded: (id: string) =>
    set((state) => {
      if (!state.data) return state;

      const toggleRecursive = (node: MindMapNode): MindMapNode => {
        if (node.id === id) {
          return {
            ...node,
            expanded: node.expanded === undefined ? false : !node.expanded,
          };
        }
        if (node.children) {
          return {
            ...node,
            children: node.children.map((child) => toggleRecursive(child)),
          };
        }
        return node;
      };

      return {
        data: {
          ...state.data,
          root: toggleRecursive(state.data.root),
          meta: {
            ...state.data.meta,
            modifiedAt: new Date().toISOString(),
          },
        },
      };
    }),

  updateBranchColor: (branchId: string, color: string) =>
    set((state) => {
      if (!state.data) return state;

      const updateColorRecursive = (node: MindMapNode, isInTargetBranch: boolean = false): MindMapNode => {
        const newNode = { ...node };
        const isTargetNode = node.branchId === branchId;
        const shouldUpdate = isTargetNode || isInTargetBranch;

        if (shouldUpdate) {
          newNode.style = {
            ...node.style,
            branchStyle: {
              ...node.style?.branchStyle,
              lineColor: color,
            },
          };
        }

        if (node.children) {
          newNode.children = node.children.map((child) =>
            updateColorRecursive(child, isTargetNode || isInTargetBranch)
          );
        }

        return newNode;
      };

      return {
        data: {
          ...state.data,
          root: updateColorRecursive(state.data.root),
          meta: {
            ...state.data.meta,
            modifiedAt: new Date().toISOString(),
          },
        },
      };
    }),

  reorderNode: (nodeId: string, targetIndex: number) =>
    set((state) => {
      if (!state.data) return state;

      type NodeWithParent = {
        node: MindMapNode;
        parentNode: MindMapNode | null;
        currentParentNode: MindMapNode | null;
        currentIndex: number;
      } | null;

      const findNodeWithParent = (
        node: MindMapNode,
        targetId: string,
        parent: MindMapNode | null,
        currentParent: MindMapNode | null
      ): NodeWithParent => {
        if (node.id === targetId) {
          return { node, parentNode: parent, currentParentNode: currentParent, currentIndex: currentParent?.children?.indexOf(node) ?? -1 };
        }
        if (node.children) {
          for (const child of node.children) {
            const result = findNodeWithParent(child, targetId, node, node);
            if (result) return result;
          }
        }
        return null;
      };

      const nodeInfo = findNodeWithParent(state.data.root, nodeId, null, null);
      if (!nodeInfo) return state;

      const { currentParentNode, currentIndex } = nodeInfo;
      if (!currentParentNode || !currentParentNode.children) return state;

      const newChildren = [...currentParentNode.children];
      const [movedNode] = newChildren.splice(currentIndex, 1);

      const adjustedIndex = Math.min(Math.max(0, targetIndex), newChildren.length);
      newChildren.splice(adjustedIndex, 0, movedNode);

      const updateChildrenRecursive = (n: MindMapNode): MindMapNode => {
        if (n.id === currentParentNode.id) {
          return { ...n, children: newChildren };
        }
        if (n.children) {
          return { ...n, children: n.children.map((child) => updateChildrenRecursive(child)) };
        }
        return n;
      };

      return {
        data: {
          ...state.data,
          root: updateChildrenRecursive(state.data.root),
          meta: {
            ...state.data.meta,
            modifiedAt: new Date().toISOString(),
          },
        },
      };
    }),

  clear: () => set({ data: createEmptyMindMap() }),
}));
