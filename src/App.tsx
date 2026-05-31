import { useState, useEffect } from 'react';
import { ReactFlowProvider } from '@xyflow/react';
import { MindMapEditor } from './components/MindMapEditor';
import { Toolbar } from './components/Toolbar';
import { ImportDialog } from './components/ImportDialog';
import { ExportDialog } from './components/ExportDialog';
import { HistoryPanel } from './components/HistoryPanel';
import { NewMindMapDialog } from './components/NewMindMapDialog';
import { useMindMapStore } from './store/mindmapStore';
import { getStorage } from './lib/storage';
import type { LayoutAlgorithm } from './lib/layout/types';
import './styles/themes.css';

const THEMES = ['classic', 'ocean', 'forest', 'sunset', 'midnight', 'minimal'] as const;
type Theme = typeof THEMES[number];

function App() {
  const { data, setData, clear } = useMindMapStore();
  const [showImportDialog, setShowImportDialog] = useState(false);
  const [showExportDialog, setShowExportDialog] = useState(false);
  const [showNewMindMapDialog, setShowNewMindMapDialog] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [theme, setTheme] = useState<Theme>('classic');
  const [layoutAlgorithm, setLayoutAlgorithm] = useState<LayoutAlgorithm>('horizontal');

  const storage = getStorage();

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
  }, [theme]);

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

  const handleClear = () => {
    if (window.confirm('确定要清空画布吗？此操作不可撤销。')) {
      clear();
      storage.clearCurrentMindMap();
    }
  };

  const handleConfirmNew = async (save: boolean, title?: string) => {
    if (save && data && title) {
      await storage.addToHistory(data, title);
    }
    clear();
    storage.clearCurrentMindMap();
  };

  const cycleTheme = () => {
    const idx = THEMES.indexOf(theme);
    setTheme(THEMES[(idx + 1) % THEMES.length]);
  };

  return (
    <div className="h-screen flex flex-col" style={{ background: 'var(--mm-bg)', color: 'var(--mm-node-text)' }}>
      <Toolbar
        onOpen={() => setShowImportDialog(true)}
        onSave={() => setShowExportDialog(true)}
        onNew={() => setShowNewMindMapDialog(true)}
        onHistory={() => setIsHistoryOpen(!isHistoryOpen)}
        onClear={handleClear}
        theme={theme}
        onCycleTheme={cycleTheme}
        layoutAlgorithm={layoutAlgorithm}
        onLayoutChange={setLayoutAlgorithm}
      />

      {isHistoryOpen && (
        <HistoryPanel
          isOpen={isHistoryOpen}
          onToggle={() => setIsHistoryOpen(false)}
          onImport={(importData) => {
            setData(importData);
            storage.saveCurrentMindMap(importData);
            setIsHistoryOpen(false);
          }}
          isDarkMode={theme === 'midnight'}
        />
      )}

      <div className="flex-1 relative overflow-hidden">
        <div className="absolute inset-0">
          {data && (
            <ReactFlowProvider>
              <MindMapEditor
                data={data}
                layoutAlgorithm={layoutAlgorithm}
              />
            </ReactFlowProvider>
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
    </div>
  );
}

export default App;
