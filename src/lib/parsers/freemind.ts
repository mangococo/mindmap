import { XMLParser } from 'fast-xml-parser';
import type { MindMapData, MindMapNode } from '../types';
import { generateId } from '../utils';

const DEFAULT_BRANCH_COLORS = [
  '#3B82F6', '#10B981', '#F59E0B', '#8B5CF6', '#EF4444', '#06B6D4', '#EC4899', '#14B8A6',
];

export function parseFreeMind(file: File): Promise<MindMapData> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        const data = parseFreeMindXML(content);
        resolve(data);
      } catch (error) {
        console.error('Failed to parse FreeMind file:', error);
        reject(new Error(`Failed to parse FreeMind file: ${error instanceof Error ? error.message : 'Unknown error'}`));
      }
    };

    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };

    reader.readAsText(file);
  });
}

export function parseFreeMindXML(xmlContent: string): MindMapData {
  const parser = new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: '',
    textNodeName: '_text',
  });

  const result = parser.parse(xmlContent);

  if (!result.map || !result.map.node) {
    throw new Error('Invalid FreeMind format: map.node not found');
  }

  const rootNode = result.map.node;
  const root = convertFreeMindNode(rootNode);
  assignBranchStyles(root);

  return {
    root,
    meta: {
      title: rootNode.TEXT || 'Imported MindMap',
      createdAt: new Date().toISOString(),
      modifiedAt: new Date().toISOString(),
    },
  };
}

function convertFreeMindNode(node: any): MindMapNode {
  const mindNode: MindMapNode = {
    id: node.id || generateId(),
    text: node.TEXT || node._text || '',
    children: [],
    expanded: true,
  };

  if (node.node && Array.isArray(node.node)) {
    mindNode.children = node.node.map((child: any) => convertFreeMindNode(child));
  } else if (node.node) {
    mindNode.children = [convertFreeMindNode(node.node)];
  }

  return mindNode;
}

function assignBranchStyles(node: MindMapNode, level: number = 0, parentBranchId?: string, parentBranchColor?: string): void {
  if (level === 0) {
    node.branchId = node.id;
  } else {
    node.branchId = parentBranchId || node.id;
  }

  if (level === 0 && node.children && node.children.length > 0) {
    node.children.forEach((child, index) => {
      const branchColor = DEFAULT_BRANCH_COLORS[index % DEFAULT_BRANCH_COLORS.length];
      child.style = {
        ...child.style,
        branchStyle: { lineColor: branchColor },
      };
      assignBranchStyles(child, level + 1, child.branchId, branchColor);
    });
  } else if (parentBranchColor && node.children && node.children.length > 0) {
    node.style = {
      ...node.style,
      branchStyle: { lineColor: parentBranchColor },
    };
    node.children.forEach((child) => {
      assignBranchStyles(child, level + 1, parentBranchId, parentBranchColor);
    });
  } else if (node.children && node.children.length > 0) {
    node.children.forEach((child) => {
      assignBranchStyles(child, level + 1, parentBranchId);
    });
  }
}

