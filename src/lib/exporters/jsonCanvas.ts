import { saveAs } from 'file-saver';
import type { MindMapData, MindMapNode, CanvasData, CanvasNode, CanvasEdge, NodePosition } from '../types';
import { generateId } from '../utils';

export function exportJSONCanvas(data: MindMapData, filename: string = 'mindmap.canvas') {
  try {
    const canvasData = convertToCanvas(data);
    const jsonString = JSON.stringify(canvasData, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    saveAs(blob, filename);
  } catch (error) {
    console.error('Failed to export JSON Canvas file:', error);
    throw new Error(`Failed to export JSON Canvas file: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

function convertToCanvas(data: MindMapData): CanvasData {
  const nodes: CanvasNode[] = [];
  const edges: CanvasEdge[] = [];
  const nodePositions = new Map<string, NodePosition>();

  calculatePositions(data.root, nodePositions, 400, 300, 0);

  nodePositions.forEach((pos, id) => {
    const node = findNodeById(data.root, id);
    if (node) {
      nodes.push({
        id,
        type: 'text',
        text: node.text,
        x: pos.x,
        y: pos.y,
        width: calculateNodeWidth(node),
        height: 50,
        color: node.style?.color,
      });
    }
  });

  createEdges(data.root, edges);

  return { nodes, edges };
}

function calculatePositions(
  node: MindMapNode,
  positions: Map<string, NodePosition>,
  x: number,
  y: number,
  depth: number
): void {
  const nodeWidth = calculateNodeWidth(node);
  const nodeHeight = 50;

  positions.set(node.id, { x, y: y - nodeHeight / 2, width: nodeWidth, height: nodeHeight });

  if (node.children && node.children.length > 0) {
    const verticalSpacing = 80;
    const horizontalSpacing = 200;

    const totalHeight = node.children.length * verticalSpacing;
    let startY = y - totalHeight / 2;

    node.children.forEach((child, index) => {
      const childX = x + nodeWidth / 2 + horizontalSpacing;
      const childY = startY + index * verticalSpacing;
      calculatePositions(child, positions, childX, childY, depth + 1);
    });
  }
}

function createEdges(node: MindMapNode, edges: CanvasEdge[]): void {
  if (node.children) {
    node.children.forEach((child) => {
      edges.push({
        id: generateId(),
        fromNode: node.id,
        toNode: child.id,
      });
      createEdges(child, edges);
    });
  }
}

function findNodeById(node: MindMapNode, id: string): MindMapNode | null {
  if (node.id === id) return node;
  if (node.children) {
    for (const child of node.children) {
      const found = findNodeById(child, id);
      if (found) return found;
    }
  }
  return null;
}

function calculateNodeWidth(node: MindMapNode): number {
  const textWidth = Math.max(node.text.length * 10, 100);
  return Math.min(textWidth, 300);
}
