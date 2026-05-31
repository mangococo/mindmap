import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import type { MindMapData, MindMapNode } from '../types';
import { escapeXML, generateId } from '../utils';
import fs from 'fs';

export async function exportXMind(data: MindMapData, filename: string = 'mindmap.xmind') {
  try {
    const contentXML = generateContentXML(data);
    const manifestXML = generateManifestXML();
    const contentTypesXML = generateContentTypesXML();

    const zip = new JSZip();
    zip.file('content.xml', contentXML);
    zip.file('META-INF/manifest.xml', manifestXML);
    zip.file('[Content_Types].xml', contentTypesXML);

    const blob = await zip.generateAsync({ type: 'blob' });

    if (typeof window === 'undefined') {
      const buffer = Buffer.from(await blob.arrayBuffer());
      fs.writeFileSync(filename, buffer);
      console.log(`文件已保存到: ${filename}`);
    } else {
      saveAs(blob, filename);
    }
  } catch (error) {
    console.error('Failed to export XMind file:', error);
    throw new Error(`Failed to export XMind file: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

function generateContentXML(data: MindMapData): string {
  const sheetId = generateId();
  const rootTopicXML = generateTopicXML(data.root, 0);

  return `<?xml version="1.0" encoding="UTF-8"?>
<xmap-content xmlns="urn:xmind:xmap:xmlns:content:2.0" xmlns:fo="http://www.w3.org/1999/XSL/Format">
  <sheet id="${sheetId}">
${rootTopicXML}
  </sheet>
</xmap-content>`;
}

function generateTopicXML(node: MindMapNode, level: number): string {
  const indent = '  '.repeat(level + 1);
  const childIndent = '  '.repeat(level + 2);

  let xml = `${indent}<topic id="${node.id}">
${childIndent}<title>${escapeXML(node.text)}</title>`;

  if (node.children && node.children.length > 0) {
    xml += `
${childIndent}<children>
${childIndent}  <topics type="attached">`;
    
    for (const child of node.children) {
      xml += '\n' + generateTopicXML(child, level + 3);
    }

    xml += `
${childIndent}  </topics>
${childIndent}</children>`;
  }

  xml += `\n${indent}</topic>`;
  return xml;
}

function generateManifestXML(): string {
  return `<?xml version="1.0" encoding="UTF-8"?>
<manifest xmlns="urn:xmind:xmap:xmlns:manifest:1.0">
  <file-entry full-path="content.xml" media-type="text/xml"/>
  <file-entry full-path="META-INF/manifest.xml" media-type="text/xml"/>
</manifest>`;
}

function generateContentTypesXML(): string {
  return `<?xml version="1.0" encoding="UTF-8"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="xml" ContentType="text/xml"/>
  <Override PartName="/content.xml" ContentType="text/xml"/>
  <Override PartName="/META-INF/manifest.xml" ContentType="text/xml"/>
</Types>`;
}
