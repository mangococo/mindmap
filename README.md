# 思维导图编辑器

一个美观的纯前端思维导图编辑器，支持多种文件格式的导入和导出。

**在线体验：** [https://mangococo.github.io/mindmap/](https://mangococo.github.io/mindmap/)

## 功能特性

### 核心功能
- ✅ 创建和编辑思维导图
- ✅ 添加、删除节点
- ✅ 拖拽画布和节点
- ✅ 缩放和平移
- ✅ 浅色/深色主题切换

### 文件格式支持

#### 导入
- ✅ **XMind** (.xmind) - 完整支持
- ✅ **FreeMind** (.mm) - 兼容 MindNode 等其他软件

#### 导出
- ✅ **XMind** (.xmind) - 标准 XMind 格式
- ✅ **JSON Canvas** (.canvas) - Obsidian Canvas 格式
- ✅ **Markdown** (.md) - 层级 Markdown 格式

## 技术栈

- **框架**: React 19 + TypeScript
- **构建工具**: Vite 7
- **样式**: Tailwind CSS
- **流程图引擎**: @xyflow/react
- **动画**: Framer Motion
- **图标**: Lucide React
- **文件处理**: JSZip, fast-xml-parser, file-saver
- **状态管理**: Zustand

## 快速开始

### 安装依赖

```bash
npm install
```

### 启动开发服务器

```bash
npm run dev
```

应用将在 http://localhost:5173/ 启动

### 构建生产版本

```bash
npm run build
```

构建产物输出到 `dist/` 目录，包含 `index.html` 和 `assets/` 资源目录。

### 构建独立 HTML 文件

如需生成单个可离线使用的 HTML 文件，使用：

```bash
npm run build:single
```

该命令通过 `vite-plugin-singlefile` 将所有 CSS 和 JavaScript 内联到 `dist/index.html` 中，可直接在浏览器中打开，无需服务器。

## 使用指南

### 基本操作

1. **添加节点**
   - 选中一个节点后，点击工具栏的"添加节点"按钮
   - 新节点将添加为选中节点的子节点

2. **删除节点**
   - 选中要删除的节点，点击工具栏的"删除节点"按钮
   - 注意：不能删除根节点

3. **编辑节点**
   - 双击节点，在弹出的对话框中修改文本
   - 点击确定保存修改

4. **导航画布**
   - 按住鼠标左键拖拽画布
   - 使用鼠标滚轮缩放

5. **选择节点**
   - 单击节点选中它

### 导入文件

1. 点击工具栏的"导入"按钮
2. 选择支持的文件格式（.xmind 或 .mm）
3. 拖拽文件到导入区域，或点击选择文件
4. 文件将自动解析并显示

### 导出文件

1. 点击工具栏的"导出"按钮
2. 选择导出格式：
   - **XMind**: 标准 XMind 格式，可在 XMind 软件中打开
   - **JSON Canvas**: Obsidian Canvas 格式
   - **Markdown**: 层级 Markdown 格式，适合文档和笔记
3. 输入文件名
4. 点击"导出"按钮下载文件

### 主题切换

点击工具栏右侧的月亮/太阳图标可以切换深色/浅色主题。

## 项目结构

```
src/
├── components/
│   ├── ContextToolbar.tsx      # 右键/上下文工具栏
│   ├── ExportDialog.tsx        # 导出对话框
│   ├── HistoryPanel.tsx        # 历史记录面板
│   ├── ImportDialog.tsx        # 导入对话框
│   ├── MindMapEditor.tsx       # 思维导图编辑器主组件
│   ├── NewMindMapDialog.tsx    # 新建导图对话框
│   ├── Toolbar.tsx             # 顶部工具栏
│   ├── edges/
│   │   └── AnimatedEdge.tsx    # 动画边
│   └── nodes/
│       ├── MindMapNode.tsx     # 节点主组件
│       ├── NodeContent.tsx     # 节点内容渲染
│       ├── NodeEditor.tsx      # 节点文本编辑
│       ├── NodeHandles.tsx     # 节点连接手柄
│       └── NodeShape.tsx       # 节点形状
├── lib/
│   ├── exporters/
│   │   ├── jsonCanvas.ts      # JSON Canvas 导出
│   │   ├── markdown.ts        # Markdown 导出
│   │   └── xmind.ts           # XMind 导出
│   ├── layout/
│   │   ├── balanced.ts        # 平衡布局
│   │   ├── horizontal.ts      # 水平布局
│   │   ├── radial.ts          # 径向布局
│   │   ├── index.ts           # 布局入口
│   │   └── types.ts           # 布局类型
│   ├── parsers/
│   │   ├── freemind.ts        # FreeMind 解析
│   │   └── xmind.ts           # XMind 解析
│   ├── storage.ts             # 本地存储
│   ├── types.ts               # TypeScript 类型
│   └── utils.ts               # 工具函数
├── store/
│   └── mindmapStore.ts        # Zustand 状态管理
├── styles/
│   └── themes.css             # 主题样式
├── App.tsx                    # 主应用组件
├── index.css                  # 全局样式
└── main.tsx                   # 应用入口
```

## 文件格式说明

### XMind 格式
XMind 文件实际上是 ZIP 压缩包，包含以下结构：
```
.xmind
├── content/
│   └── content.xml          # 主要内容
├── styles/                  # 样式文件（可选）
├── META-INF/
│   └── manifest.xml         # 文件清单
└── [Content_Types].xml     # 内容类型定义
```

### FreeMind 格式
FreeMind 使用简单的 XML 结构：
```xml
<map version="1.0.1">
  <node TEXT="中心主题">
    <node TEXT="子主题1">
      <node TEXT="详细内容"/>
    </node>
  </node>
</map>
```

### JSON Canvas 格式
JSON Canvas 是 Obsidian Canvas 使用的格式：
```json
{
  "nodes": [
    {
      "id": "root",
      "type": "text",
      "text": "中心主题",
      "x": 100,
      "y": 100,
      "width": 150,
      "height": 50
    }
  ],
  "edges": [
    {
      "id": "edge1",
      "fromNode": "root",
      "toNode": "child1"
    }
  ]
}
```

## 许可证

MIT

## 贡献

欢迎提交 Issue 和 Pull Request！
