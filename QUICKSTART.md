# 快速开始指南

## 安装和运行

### 1. 安装依赖

```bash
npm install
```

### 2. 启动开发服务器

```bash
npm run dev
```

应用将在浏览器中自动打开，地址为 http://localhost:5173/

### 3. 构建生产版本

```bash
npm run build
```

构建产物将输出到 `dist/` 目录，可以部署到任何静态托管平台。

### 4. 构建独立 HTML 文件

如果需要将应用打包为一个独立的 HTML 文件（包含所有资源，无需网络连接），可以手动创建：

```bash
# 1. 先构建生产版本
npm run build

# 2. 创建独立的 HTML 文件
cat << 'EOF' > standalone.html
<!doctype html>
<html lang="zh-CN">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>思维导图编辑器</title>
    <style>
EOF
cat dist/assets/index-*.css >> standalone.html
cat << 'EOF' >> standalone.html
    </style>
  </head>
  <body>
    <div id="root"></div>
    <script type="module">
EOF
cat dist/assets/index-*.js >> standalone.html
cat << 'EOF' >> standalone.html
    </script>
  </body>
</html>
EOF
```

生成的 `standalone.html` 文件（约 460KB）包含所有功能，可以直接在浏览器中打开使用，无需服务器。

**特性：**
- ✅ 所有 CSS 和 JavaScript 已内联
- ✅ 无外部资源依赖
- ✅ 可离线使用
- ✅ 支持所有功能（思维导图编辑、导入/导出、主题切换等）

## 功能演示

### 导入 XMind 文件

1. 准备一个 .xmind 文件
2. 点击工具栏的"导入"按钮
3. 拖拽文件到对话框中，或点击选择文件
4. 文件将自动解析并显示

### 创建思维导图

1. 应用启动时会创建一个默认的思维导图
2. 点击"添加节点"按钮添加子节点
3. 双击节点编辑文本
4. 拖拽画布或使用滚轮缩放

### 导出为不同格式

#### XMind 格式
1. 点击"导出"按钮
2. 选择"XMind"
3. 输入文件名
4. 点击"导出"下载 .xmind 文件

#### JSON Canvas 格式
1. 点击"导出"按钮
2. 选择"JSON Canvas"
3. 输入文件名
4. 点击"导出"下载 .canvas 文件

#### Markdown 格式
1. 点击"导出"按钮
2. 选择"Markdown"
3. 输入文件名
4. 点击"导出"下载 .md 文件

### 切换主题

点击工具栏右侧的月亮/太阳图标可以在浅色和深色主题之间切换。

## 快捷键

- **单击节点**: 选中节点
- **双击节点**: 编辑节点文本
- **拖拽画布**: 移动视图
- **鼠标滚轮**: 缩放视图

## 支持的文件格式

### 导入
- XMind (.xmind)
- FreeMind (.mm)

### 导出
- XMind (.xmind)
- JSON Canvas (.canvas)
- Markdown (.md)

## 技术特性

- 纯前端应用，无需后端
- 数据完全在本地处理，保护隐私
- 响应式设计，支持各种屏幕尺寸
- 使用现代 Web 技术栈

## 常见问题

### Q: 导入文件失败怎么办？
A: 确保文件格式正确（.xmind 或 .mm），并且文件未损坏。

### Q: 导出的文件无法在其他软件中打开？
A: 确保导出格式与目标软件兼容。XMind 文件应该在 XMind 软件中打开，FreeMind 文件应该在 FreeMind 或兼容软件中打开。

### Q: 如何保存我的工作？
A: 导出为你需要的格式即可保存。应用目前不支持自动保存到本地存储，未来版本可能会添加此功能。

### Q: 节点可以添加多少层？
A: 理论上没有限制，但建议不要超过 10 层，以保持可读性。

## 开发者信息

- 项目使用 React + TypeScript + Vite 构建
- 使用 @ant-design/graphs 实现思维导图可视化
- 使用 Zustand 进行状态管理
- 使用 Tailwind CSS 进行样式设计

## 贡献和反馈

欢迎提交 Issue 和 Pull Request！
