import { saveAs } from 'file-saver';
import type { MindMapData, MindMapNode } from '../types';

export function exportMarkdown(data: MindMapData, filename: string = 'mindmap.md') {
  try {
    const markdown = convertToMarkdown(data);
    const blob = new Blob([markdown], { type: 'text/markdown' });
    saveAs(blob, filename);
  } catch (error) {
    console.error('Failed to export Markdown file:', error);
    throw new Error(`Failed to export Markdown file: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

function convertToMarkdown(data: MindMapData): string {
  let markdown = `# ${data.root.text}\n\n`;

  if (data.root.children) {
    data.root.children.forEach((child) => {
      markdown += nodeToMarkdown(child, 2) + '\n';
    });
  }

  return markdown;
}

function nodeToMarkdown(node: MindMapNode, level: number): string {
  const indent = '#'.repeat(level);
  let markdown = `${indent} ${node.text}\n`;
  
  if (node.note) {
    markdown += `\n${node.note}\n`;
  }
  
  markdown += '\n';

  if (node.children && node.children.length > 0) {
    node.children.forEach((child) => {
      markdown += nodeToMarkdown(child, level + 1);
    });
  }

  return markdown;
}
