import { useState, useEffect } from 'react';
import { MindMapEditor } from './components/MindMapEditor';
import { Toolbar } from './components/Toolbar';
import { ImportDialog } from './components/ImportDialog';
import { ExportDialog } from './components/ExportDialog';
import { HistoryPanel } from './components/HistoryPanel';
import { NewMindMapDialog } from './components/NewMindMapDialog';
import { useMindMapStore } from './store/mindmapStore';
import { getStorage } from './lib/storage';

function App() {
  const { data, setData, addChild, updateNode, updateNodeData, deleteNode, toggleNodeExpanded, updateBranchColor, clear } = useMindMapStore();
  const [showImportDialog, setShowImportDialog] = useState(false);
  const [showExportDialog, setShowExportDialog] = useState(false);
  const [showNewMindMapDialog, setShowNewMindMapDialog] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);

  const storage = getStorage();

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  useEffect(() => {
    const loadSavedMindMap = async () => {
      const savedData = await storage.getCurrentMindMap();
      if (savedData) {
        setData(savedData);
      }
    };
    loadSavedMindMap();
  }, []);

  useEffect(() => {
    if (data) {
      const timeout = setTimeout(() => {
        storage.saveCurrentMindMap(data);
      }, 1000);

      return () => clearTimeout(timeout);
    }
  }, [data, storage]);

  const handleImport = (importData: any) => {
    setData(importData);
    storage.saveCurrentMindMap(importData);
    setShowImportDialog(false);
  };

  const handleOpen = () => {
    setShowImportDialog(true);
  };

  const handleSave = () => {
    setShowExportDialog(true);
  };

  const handleHistory = async () => {
    setIsHistoryOpen(!isHistoryOpen);
  };

  const handleToggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };

  const handleClear = () => {
    if (window.confirm('确定要清空画布吗？此操作不可撤销。')) {
      clear();
      storage.clearCurrentMindMap();
    }
  };

  const handleNew = () => {
    setShowNewMindMapDialog(true);
  };

  const handleConfirmNew = async (save: boolean, title?: string) => {
    if (save && data && title) {
      await storage.addToHistory(data, title);
    }
    clear();
    storage.clearCurrentMindMap();
  };

  return (
    <div className="h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
      <Toolbar
        onOpen={handleOpen}
        onSave={handleSave}
        onNew={handleNew}
        onHistory={handleHistory}
        onClear={handleClear}
        isDarkMode={isDarkMode}
        onToggleTheme={handleToggleTheme}
      />

      {isHistoryOpen && (
        <HistoryPanel
          isOpen={isHistoryOpen}
          onToggle={handleHistory}
          onImport={(importData) => {
            setData(importData);
            storage.saveCurrentMindMap(importData);
            setIsHistoryOpen(false);
          }}
          isDarkMode={isDarkMode}
        />
      )}

      <div className="flex-1 relative overflow-hidden">
        <div className="absolute inset-0">
          {data && (
            <MindMapEditor
              data={data}
              onAddChild={addChild}
              onUpdateNode={updateNode}
              onUpdateNodeData={updateNodeData}
              onDeleteNode={deleteNode}
              onToggleNodeExpanded={toggleNodeExpanded}
              onUpdateBranchColor={updateBranchColor}
            />
          )}
        </div>
      </div>

      <ImportDialog
        isOpen={showImportDialog}
        onClose={() => setShowImportDialog(false)}
        onImport={handleImport}
      />

      <ExportDialog
        isOpen={showExportDialog}
        onClose={() => setShowExportDialog(false)}
        data={data}
      />

      <NewMindMapDialog
        isOpen={showNewMindMapDialog}
        onClose={() => setShowNewMindMapDialog(false)}
        onConfirm={handleConfirmNew}
      />

      <div className="fixed bottom-4 right-4 text-sm text-gray-500 dark:text-gray-400">
        {data && `节点数: ${countNodes(data.root)}`}
      </div>
    </div>
  );
}

function countNodes(node: any): number {
  if (!node) return 0;
  let count = 1;
  if (node.children) {
    for (const child of node.children) {
      count += countNodes(child);
    }
  }
  return count;
}

export default App;
