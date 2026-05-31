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
  const [zenMode, setZenMode] = useState(false);

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

  // Esc to exit ZEN mode
  useEffect(() => {
    if (!zenMode) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setZenMode(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [zenMode]);

  return (
    <div className="h-screen flex flex-col" style={{ background: 'var(--mm-bg)', color: 'var(--mm-node-text)' }}>
      {!zenMode && (
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
          onZenMode={() => setZenMode(true)}
        />
      )}

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
                zenMode={zenMode}
              />
            </ReactFlowProvider>
          )}
        </div>
        {zenMode && (
          <div
            className="absolute bottom-6 left-1/2 -translate-x-1/2 px-4 py-2 rounded-full text-sm opacity-40 hover:opacity-80 transition-opacity cursor-pointer"
            style={{ background: 'var(--mm-toolbar-bg)', backdropFilter: 'blur(8px)', color: 'var(--mm-node-text)' }}
            onClick={() => setZenMode(false)}
          >
            按 Esc 退出沉浸模式
          </div>
        )}
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
