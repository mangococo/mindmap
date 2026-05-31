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

/** Measure a node for the balanced layout. */
function calculateSize(
  node: MindMapNode,
  level: number,
): { width: number; height: number; totalHeight: number } {
  if (node.image) {
    return { width: 80, height: 80, totalHeight: 80 };
  }
  const fontSize = level === 0 ? 18 : 14;
  const paddingX = level === 0 ? 32 : 16;
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

/**
 * Position a subtree using horizontal layout logic.
 * `direction` is +1 for right side, -1 for left (mirrored).
 */
function layoutSubtree(
  node: MindMapNode,
  x: number,
  y: number,
  level: number,
  direction: 1 | -1,
  branchColor: string | undefined,
  horizontalGap: number,
  nodes: Node<MindMapNodeData>[],
  edges: Edge[],
): void {
  const { width, totalHeight } = calculateSize(node, level);

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

  // Child x position: move right or left from parent
  const childX = x + direction * (width + horizontalGap);

  let currentY = y - totalHeight / 2;

  visibleChildren.forEach((child, index) => {
    const childSize = calculateSize(child, level + 1);
    const childY = currentY + childSize.totalHeight / 2;

    const edgeColor =
      child.style?.branchStyle?.lineColor ??
      ownBranchColor ??
      (level === 0
        ? DEFAULT_BRANCH_COLORS[index % DEFAULT_BRANCH_COLORS.length]
        : undefined);

    layoutSubtree(
      child,
      childX,
      childY,
      level + 1,
      direction,
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
 * Balanced (bidirectional) layout algorithm.
 * Root at center; first half of children go right, second half go left.
 */
export function balancedLayout(
  root: MindMapNode,
  nodeSpacing: number = 80,
  _levelSpacing: number = 60,
): LayoutResult {
  const nodes: Node<MindMapNodeData>[] = [];
  const edges: Edge[] = [];

  // Place the root node
  const rootSize = calculateSize(root, 0);
  const rootBranchColor = root.style?.branchStyle?.lineColor;

  nodes.push({
    id: root.id,
    type: 'mindmap',
    position: { x: 0, y: 0 },
    data: {
      text: root.text,
      level: 0,
      style: root.style,
      image: root.image,
      note: root.note,
      branchColor: rootBranchColor,
      hasChildren: !!(root.children && root.children.length > 0),
      expanded: root.expanded !== false,
    },
  });

  const visibleChildren = root.expanded !== false ? root.children ?? [] : [];

  if (visibleChildren.length === 0) {
    return { nodes, edges };
  }

  // Split children: first half right, second half left
  const mid = Math.ceil(visibleChildren.length / 2);
  const rightChildren = visibleChildren.slice(0, mid);
  const leftChildren = visibleChildren.slice(mid);

  // Calculate total heights for each side to centre them vertically
  const rightTotalHeight =
    rightChildren.reduce(
      (sum, child) => sum + calculateSize(child, 1).totalHeight,
      0,
    ) +
    (rightChildren.length - 1) * 20;

  const leftTotalHeight =
    leftChildren.reduce(
      (sum, child) => sum + calculateSize(child, 1).totalHeight,
      0,
    ) +
    (leftChildren.length - 1) * 20;

  // Layout right side
  let currentY = -rightTotalHeight / 2;
  rightChildren.forEach((child, index) => {
    const childSize = calculateSize(child, 1);
    const childY = currentY + childSize.totalHeight / 2;
    const edgeColor =
      child.style?.branchStyle?.lineColor ??
      rootBranchColor ??
      DEFAULT_BRANCH_COLORS[index % DEFAULT_BRANCH_COLORS.length];

    layoutSubtree(
      child,
      rootSize.width + nodeSpacing,
      childY,
      1,
      1,
      edgeColor,
      nodeSpacing,
      nodes,
      edges,
    );

    edges.push({
      id: `${root.id}-${child.id}`,
      source: root.id,
      target: child.id,
      type: 'bezier',
      data: { color: edgeColor },
    });

    currentY += childSize.totalHeight + 20;
  });

  // Layout left side (mirrored)
  currentY = -leftTotalHeight / 2;
  leftChildren.forEach((child, index) => {
    const childSize = calculateSize(child, 1);
    const childY = currentY + childSize.totalHeight / 2;
    const edgeColor =
      child.style?.branchStyle?.lineColor ??
      rootBranchColor ??
      DEFAULT_BRANCH_COLORS[(mid + index) % DEFAULT_BRANCH_COLORS.length];

    layoutSubtree(
      child,
      -(childSize.width + nodeSpacing),
      childY,
      1,
      -1,
      edgeColor,
      nodeSpacing,
      nodes,
      edges,
    );

    edges.push({
      id: `${root.id}-${child.id}`,
      source: root.id,
      target: child.id,
      type: 'bezier',
      data: { color: edgeColor },
    });

    currentY += childSize.totalHeight + 20;
  });

  return { nodes, edges };
}
