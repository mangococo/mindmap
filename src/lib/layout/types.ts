import type { Node, Edge } from '@xyflow/react';
import type { NodeStyle } from '../types';

// Layout algorithm types
export type LayoutAlgorithm = 'horizontal' | 'radial' | 'balanced';

// Shape types for node rendering
export type ShapeType = 'rounded' | 'capsule' | 'diamond' | 'oval';

// Node data carried by each React Flow node
export interface MindMapNodeData {
  [key: string]: unknown;
  text: string;
  level: number;
  style?: NodeStyle;
  image?: string;
  note?: string;
  branchColor?: string;
  hasChildren: boolean;
  expanded: boolean;
}

// Configuration for the layout computation
export interface LayoutConfig {
  algorithm: LayoutAlgorithm;
  /** Horizontal gap between a parent and its children (default 80) */
  nodeSpacing?: number;
  /** Vertical gap between levels or radial distance increment (default 60) */
  levelSpacing?: number;
}

// Result of a layout computation: React Flow compatible nodes and edges
export interface LayoutResult {
  nodes: Node<MindMapNodeData>[];
  edges: Edge[];
}
