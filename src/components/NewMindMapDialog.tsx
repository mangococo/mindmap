import React, { useState, useEffect } from 'react';
import { X, Save, AlertCircle } from 'lucide-react';

interface NewMindMapDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (save: boolean, title?: string) => void;
}

export const NewMindMapDialog: React.FC<NewMindMapDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
}) => {
  const [step, setStep] = useState<'confirm' | 'input'>('confirm');
  const [title, setTitle] = useState('');

  useEffect(() => {
    if (isOpen) {
      setStep('confirm');
      setTitle(formatDateTime(new Date()));
    }
  }, [isOpen]);

  const formatDateTime = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    return `${year}${month}${day}-${hours}${minutes}${seconds}`;
  };

  const handleSaveClick = () => {
    setStep('input');
  };

  const handleDontSaveClick = () => {
    onConfirm(false);
    onClose();
  };

  const handleConfirmSave = () => {
    onConfirm(true, title.trim() || formatDateTime(new Date()));
    onClose();
  };

  const handleCancel = () => {
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm"
        onClick={handleCancel}
      />
      <div
        className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden"
        style={{ animation: 'scaleIn 0.2s ease-out' }}
      >
        <style>{`
          @keyframes scaleIn {
            from {
              opacity: 0;
              transform: scale(0.95);
            }
            to {
              opacity: 1;
              transform: scale(1);
            }
          }
        `}</style>

        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {step === 'confirm' ? '新建画布' : '保存画布'}
            </h3>
            <button
              onClick={handleCancel}
              className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <X size={20} className="text-gray-500 dark:text-gray-400" />
            </button>
          </div>
        </div>

        <div className="p-6">
          {step === 'confirm' ? (
            <>
              <div className="flex items-start gap-3 mb-6">
                <div className="flex-shrink-0">
                  <AlertCircle size={24} className="text-blue-500" />
                </div>
                <div>
                  <p className="text-gray-700 dark:text-gray-300 mb-2">
                    是否保存当前画布到历史记录？
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    如果不保存，当前的内容将丢失。
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleSaveClick}
                  className="flex-1 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                >
                  <Save size={18} />
                  保存后新建
                </button>
                <button
                  onClick={handleDontSaveClick}
                  className="flex-1 px-4 py-2.5 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg font-medium transition-colors"
                >
                  不保存，直接新建
                </button>
              </div>
            </>
          ) : (
            <>
              <div className="mb-6">
                <label htmlFor="mindmap-title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  画布名称
                </label>
                <input
                  id="mindmap-title"
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleConfirmSave();
                    }
                  }}
                  placeholder="请输入画布名称"
                  className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                  autoFocus
                />
                <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                  默认为当前时间格式
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleConfirmSave}
                  className="flex-1 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                >
                  <Save size={18} />
                  确认保存并新建
                </button>
                <button
                  onClick={handleCancel}
                  className="flex-1 px-4 py-2.5 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg font-medium transition-colors"
                >
                  取消
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
