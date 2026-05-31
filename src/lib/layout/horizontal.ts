import type { Node, Edge } from '@xyflow/react';
import type { MindMapNode } from '../types';
import type { LayoutResult, MindMapNodeData } from './types';

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

/** Measure a single node and aggregate the height needed by its subtree. */
function calculateSize(
  node: MindMapNode,
  level: number,
): { width: number; height: number; totalHeight: number } {
  if (node.image) {
    return { width: 80, height: 80, totalHeight: 80 };
  }

  const fontSize = level === 0 ? 18 : 14;
  const paddingX = level === 0 ? 40 : 20;
  const textWidth = Math.max(node.text.length * fontSize * 0.7, 40);
  const width = textWidth + paddingX * 2;
  const height = level === 0 ? 60 : 24;

  const visibleChildren =
    node.expanded !== false ? node.children ?? [] : [];

  if (visibleChildren.length > 0) {
    const childrenHeight = visibleChildren.reduce(
      (sum, child) => sum + calculateSize(child, level + 1).totalHeight,
      0,
    );
    const siblingGap = 20;
    const totalWithGaps =
      childrenHeight + (visibleChildren.length - 1) * siblingGap;
    return { width, height, totalHeight: Math.max(height, totalWithGaps) };
  }

  return { width, height, totalHeight: height };
}

/** Recursively position nodes left-to-right and collect React Flow results. */
function layoutNode(
  node: MindMapNode,
  x: number,
  y: number,
  level: number,
  branchColor: string | undefined,
  horizontalGap: number,
  nodes: Node<MindMapNodeData>[],
  edges: Edge[],
): void {
  const { width, totalHeight } = calculateSize(node, level);

  // Determine the colour for edges emanating from this node
  const ownBranchColor =
    node.style?.branchStyle?.lineColor ?? branchColor;

  nodes.push({
    id: node.id,
    type: 'mindmap',
    position: { x, y },
    data: {
      text: node.text,
      level,
      style: node.style,
      image: node.image,
      note: node.note,
      branchColor: ownBranchColor,
      hasChildren: !!(node.children && node.children.length > 0),
      expanded: node.expanded !== false,
    },
  });

  const visibleChildren = node.expanded !== false ? node.children ?? [] : [];

  if (visibleChildren.length === 0) return;

  let currentY = y - totalHeight / 2;
  const childX = x + width + horizontalGap;

  visibleChildren.forEach((child, index) => {
    const childSize = calculateSize(child, level + 1);
    const childY = currentY + childSize.totalHeight / 2;

    // Colour precedence: child's own branch style > parent's > auto-assigned from root
    const edgeColor =
      child.style?.branchStyle?.lineColor ??
      ownBranchColor ??
      (level === 0
        ? DEFAULT_BRANCH_COLORS[index % DEFAULT_BRANCH_COLORS.length]
        : undefined);

    layoutNode(
      child,
      childX,
      childY,
      level + 1,
      edgeColor,
      horizontalGap,
      nodes,
      edges,
    );

    edges.push({
      id: `${node.id}-${child.id}`,
      source: node.id,
      target: child.id,
      type: 'bezier',
      data: { color: edgeColor },
    });

    currentY += childSize.totalHeight + 20;
  });
}

/**
 * Horizontal (left-to-right) layout algorithm.
 * Positions the root at the origin with children spreading to the right.
 */
export function horizontalLayout(
  root: MindMapNode,
  nodeSpacing: number = 80,
  _levelSpacing: number = 60,
): LayoutResult {
  const nodes: Node<MindMapNodeData>[] = [];
  const edges: Edge[] = [];

  layoutNode(root, 0, 0, 0, undefined, nodeSpacing, nodes, edges);

  return { nodes, edges };
}
