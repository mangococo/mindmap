import type { MindMapNode } from './types';

export function generateId(): string {
  return `node_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

export function escapeXML(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

export function findNodeById(node: MindMapNode, id: string): MindMapNode | null {
  if (node.id === id) return node;
  if (node.children) {
    for (const child of node.children) {
      const found = findNodeById(child, id);
      if (found) return found;
    }
  }
  return null;
}

export function deleteNodeById(node: MindMapNode, id: string): MindMapNode | null {
  if (!node.children) return node;

  const index = node.children.findIndex(child => child.id === id);
  if (index !== -1) {
    node.children.splice(index, 1);
    return node;
  }

  for (const child of node.children) {
    deleteNodeById(child, id);
  }

  return node;
}

export function countNodes(node: MindMapNode): number {
  let count = 1;
  if (node.children) {
    for (const child of node.children) {
      count += countNodes(child);
    }
  }
  return count;
}
