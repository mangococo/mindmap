export interface MindMapNode {
  id: string;
  text: string;
  children?: MindMapNode[];
  style?: NodeStyle;
  expanded?: boolean;
  note?: string;
  image?: string;
  imageSize?: { width: number; height: number };
  branchId?: string; // 用于标识分支，便于批量更新分支样式
}

// Branch styling options for connection lines
export interface BranchStyle {
  lineColor?: string;
  lineWidth?: number;
}

// Node styling options
export interface NodeStyle {
  color?: string;
  fontSize?: number;
  bold?: boolean;
  italic?: boolean;
  background?: string;
  showBorder?: boolean; // 显示/隐藏边框
  borderStyle?: 'rectangle' | 'rounded' | 'capsule'; // 边框样式
  branchStyle?: BranchStyle; // 分支样式（继承）
}

// Complete mind map data
export interface MindMapData {
  root: MindMapNode;
  meta?: {
    title?: string;
    author?: string;
    version?: string;
    createdAt?: string;
    modifiedAt?: string;
  };
}

// Export format types
export type ExportFormat = 'xmind' | 'jsoncanvas' | 'markdown' | 'freemind';

// Import format types
export type ImportFormat = 'xmind' | 'freemind';

// Node position for canvas export
export interface NodePosition {
  x: number;
  y: number;
  width: number;
  height: number;
}

// Edge for canvas export
export interface CanvasEdge {
  id: string;
  fromNode: string;
  toNode: string;
}

// Canvas node for export
export interface CanvasNode {
  id: string;
  type: 'text';
  text: string;
  x: number;
  y: number;
  width: number;
  height: number;
  color?: string;
}

// Complete canvas structure
export interface CanvasData {
  nodes: CanvasNode[];
  edges: CanvasEdge[];
}
