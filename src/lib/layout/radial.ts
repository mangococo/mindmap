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

/** Pick the handle position (top/right/bottom/left) closest to the given angle. */
function handleIdFromAngle(angle: number, prefix: 'source' | 'target'): string {
  // Normalize to [0, 2π)
  const a = ((angle % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);
  if (a < Math.PI / 4 || a >= 7 * Math.PI / 4) return `${prefix}-right`;
  if (a < 3 * Math.PI / 4) return `${prefix}-bottom`;
  if (a < 5 * Math.PI / 4) return `${prefix}-left`;
  return `${prefix}-top`;
}

interface RadialSubtree {
  node: MindMapNode;
  level: number;
  angleStart: number;
  angleEnd: number;
}

/**
 * Recursively position nodes in a radial pattern.
 * Level-1 children are placed on a circle around the root.
 * Deeper levels subdivide the parent's angular range.
 */
function layoutRadialSubtree(
  subtree: RadialSubtree,
  parentX: number,
  parentY: number,
  radius: number,
  branchColor: string | undefined,
  nodes: Node<MindMapNodeData>[],
  edges: Edge[],
): void {
  const { node, level, angleStart, angleEnd } = subtree;
  const midAngle = (angleStart + angleEnd) / 2;

  // Place the node at the computed radial position
  const x =
    level === 0 ? 0 : parentX + radius * Math.cos(midAngle);
  const y =
    level === 0 ? 0 : parentY + radius * Math.sin(midAngle);

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

  // Subdivide the angular range among children proportionally
  const totalChildren = visibleChildren.length;
  const angleSpan = angleEnd - angleStart;

  // Add padding between sibling arcs to reduce overlap
  const paddingFraction = totalChildren > 1 ? 0.05 : 0;
  const usableSpan = angleSpan * (1 - paddingFraction * (totalChildren - 1));
  const paddingAmount = angleSpan * paddingFraction;

  let currentAngle = angleStart;

  visibleChildren.forEach((child, index) => {
    const childAngleSpan = usableSpan / totalChildren;
    const childStart = currentAngle;
    const childEnd = currentAngle + childAngleSpan;
    const childMidAngle = (childStart + childEnd) / 2;

    const edgeColor =
      child.style?.branchStyle?.lineColor ??
      ownBranchColor ??
      (level === 0
        ? DEFAULT_BRANCH_COLORS[index % DEFAULT_BRANCH_COLORS.length]
        : undefined);

    layoutRadialSubtree(
      {
        node: child,
        level: level + 1,
        angleStart: childStart,
        angleEnd: childEnd,
      },
      x,
      y,
      radius,
      edgeColor,
      nodes,
      edges,
    );

    // Source handle faces the child's direction; target handle faces back to parent
    const sourceAngle = childMidAngle;
    const targetAngle = childMidAngle + Math.PI;

    edges.push({
      id: `${node.id}-${child.id}`,
      source: node.id,
      target: child.id,
      sourceHandle: handleIdFromAngle(sourceAngle, 'source'),
      targetHandle: handleIdFromAngle(targetAngle, 'target'),
      type: 'bezier',
      data: { color: edgeColor },
    });

    currentAngle = childEnd + paddingAmount;
  });
}

/**
 * Radial layout algorithm.
 * Root at center (0, 0), level-1 children evenly distributed on a circle,
 * deeper levels subdivide their parent's angular arc.
 */
export function radialLayout(
  root: MindMapNode,
  nodeSpacing: number = 80,
  levelSpacing: number = 60,
): LayoutResult {
  const nodes: Node<MindMapNodeData>[] = [];
  const edges: Edge[] = [];
  const radius = nodeSpacing * 2.5; // base radius for level-1 ring

  // Full 2*pi distribution for level-1 children
  layoutRadialSubtree(
    {
      node: root,
      level: 0,
      angleStart: 0,
      angleEnd: 2 * Math.PI,
    },
    0,
    0,
    radius + levelSpacing,
    undefined,
    nodes,
    edges,
  );

  return { nodes, edges };
}
