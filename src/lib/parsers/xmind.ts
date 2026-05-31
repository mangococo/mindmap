import JSZip from 'jszip';
import { XMLParser } from 'fast-xml-parser';
import type { MindMapData, MindMapNode } from '../types';
import { generateId } from '../utils';

const DEFAULT_BRANCH_COLORS = [
  '#3B82F6', '#10B981', '#F59E0B', '#8B5CF6', '#EF4444', '#06B6D4', '#EC4899', '#14B8A6',
];

export async function parseXMind(file: File): Promise<MindMapData> {
  try {
    const zip = new JSZip();
    const contents = await zip.loadAsync(file);

    const jsonFile = contents.file('content.json');
    if (jsonFile) {
      const jsonContent = await jsonFile.async('string');
      const data = JSON.parse(jsonContent);
      const sheet = Array.isArray(data) ? data[0] : data;
      const rootTopic = sheet.rootTopic;

      if (!rootTopic) {
        throw new Error('Invalid XMind JSON format: rootTopic not found');
      }

      const root = convertXMindJSONNode(rootTopic);
      assignBranchStyles(root);

      return {
        root,
        meta: {
          title: sheet.title || 'Imported MindMap',
          createdAt: new Date().toISOString(),
          modifiedAt: new Date().toISOString(),
        }
      };
    }

    const contentFile = contents.file('content.xml');
    if (!contentFile) {
      throw new Error('Invalid XMind file: content.json or content.xml not found');
    }

    const contentXML = await contentFile.async('string');
    const parser = new XMLParser({
      ignoreAttributes: false,
      attributeNamePrefix: '',
      textNodeName: '_text',
    });

    const result = parser.parse(contentXML);
    const xmapContent = result['xmap-content'];

    if (!xmapContent) {
      throw new Error('Invalid XMind XML format: xmap-content not found');
    }

    const sheet = Array.isArray(xmapContent.sheet) ? xmapContent.sheet[0] : xmapContent.sheet;
    const rootTopic = sheet.topic;

    const root = convertXMindXMLNode(rootTopic);
    assignBranchStyles(root);

    return {
      root,
      meta: {
        title: sheet.title || 'Imported MindMap',
        createdAt: new Date().toISOString(),
        modifiedAt: new Date().toISOString(),
      },
    };
  } catch (error) {
    console.error('Failed to parse XMind file:', error);
    throw new Error(`Failed to parse XMind file: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

function convertXMindJSONNode(topic: any): MindMapNode {
  const node: MindMapNode = {
    id: topic.id || generateId(),
    text: topic.title || '',
    note: topic.notes?.plain?.content || topic.notes?.realHtml?.content,
    children: [],
    expanded: true,
  };

  if (topic.image && topic.image.src) {
    if (topic.image.src.startsWith('http') || topic.image.src.startsWith('data:')) {
        node.image = topic.image.src;
    }
  }

  if (topic.children && topic.children.attached) {
    const attached = Array.isArray(topic.children.attached)
      ? topic.children.attached
      : [topic.children.attached];

    node.children = attached.map((t: any) => convertXMindJSONNode(t));
  }

  return node;
}

function convertXMindXMLNode(topic: any): MindMapNode {
  let title = topic.title || topic._text || '';
  if (typeof topic.title === 'object' && topic.title._text) {
    title = topic.title._text;
  }

  const node: MindMapNode = {
    id: topic.id || generateId(),
    text: title,
    children: [],
    expanded: true,
  };

  if (topic.children && topic.children.topics) {
    const topics = topic.children.topics;
    const childrenArray: any[] = [];

    if (Array.isArray(topics)) {
      childrenArray.push(...topics);
    } else if (typeof topics === 'object') {
      if (Array.isArray(topics.topic)) {
        childrenArray.push(...topics.topic);
      } else {
        Object.values(topics).forEach((t: any) => {
          if (Array.isArray(t?.topic)) {
            childrenArray.push(...t.topic);
          } else if (t) {
            childrenArray.push(t);
          }
        });
      }
    }

    node.children = childrenArray
      .map((t: any) => {
        if (typeof t === 'object' && t.topic) {
          return convertXMindXMLNode(t.topic);
        }
        if (typeof t === 'object' && (t.title !== undefined || t._text !== undefined)) {
          return convertXMindXMLNode(t);
        }
        return null;
      })
      .filter((n: any): n is MindMapNode => n !== null);
  }

  return node;
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
