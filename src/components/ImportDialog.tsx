import React, { useRef, useState } from 'react';
import { UploadCloud, FileText, X, FileJson, AlertCircle, CheckCircle2, FileUp, Sparkles } from 'lucide-react';
import { parseXMind } from '../lib/parsers/xmind';
import { parseFreeMind } from '../lib/parsers/freemind';

interface ImportDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (data: any) => void;
}

export const ImportDialog: React.FC<ImportDialogProps> = ({
  isOpen,
  onClose,
  onImport,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [success, setSuccess] = useState(false);

  if (!isOpen) return null;

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      await handleFile(files[0]);
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      await handleFile(files[0]);
    }
  };

  const handleFile = async (file: File) => {
    setLoading(true);
    setError(null);
    setSelectedFile(file);
    setSuccess(false);

    try {
      const extension = file.name.split('.').pop()?.toLowerCase();
      let data;

      if (extension === 'xmind') {
        data = await parseXMind(file);
      } else if (extension === 'mm') {
        data = await parseFreeMind(file);
      } else {
        throw new Error('不支持的文件格式。请选择 .xmind 或 .mm 文件');
      }

      setSuccess(true);
      setTimeout(() => {
        onImport(data);
        onClose();
        resetState();
      }, 800);
    } catch (err) {
      setError(err instanceof Error ? err.message : '导入失败');
      setSelectedFile(null);
    } finally {
      setLoading(false);
    }
  };

  const handleClick = () => {
    if (!loading && !success) {
      fileInputRef.current?.click();
    }
  };

  const resetState = () => {
    setSelectedFile(null);
    setError(null);
    setSuccess(false);
    setLoading(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const getFileIcon = () => {
    if (selectedFile) {
      const ext = selectedFile.name.split('.').pop()?.toLowerCase();
      return ext === 'xmind' ? <FileJson size={64} className="text-purple-500" /> : <FileText size={64} className="text-blue-500" />;
    }
    return <UploadCloud size={64} className="text-gray-400 dark:text-gray-500" />;
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
      <div className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-2xl rounded-3xl shadow-[0_25px_50px_-12px_rgba(0,0,0,0.25)] dark:shadow-[0_25px_50px_-12px_rgba(0,0,0,0.5)] border border-white/50 dark:border-gray-700/50 max-w-xl w-full transform transition-all duration-300 animate-in zoom-in-95 fade-in">
        <div className="flex items-center justify-between px-8 py-6 border-b border-gray-100 dark:border-gray-800/50">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 via-cyan-500 to-teal-500 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/25 animate-in fade-in slide-in-from-left-2 duration-500">
              <UploadCloud size={22} className="text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold bg-gradient-to-r from-gray-900 via-gray-700 to-gray-900 dark:from-white dark:via-gray-200 dark:to-white bg-clip-text text-transparent">
                导入文件
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">上传并解析您的思维导图</p>
            </div>
          </div>
          <button
            onClick={() => {
              onClose();
              resetState();
            }}
            className="p-2.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-all duration-200 group"
            aria-label="关闭"
          >
            <X size={20} className="text-gray-400 dark:text-gray-500 group-hover:text-gray-600 dark:group-hover:text-gray-300 transition-colors" />
          </button>
        </div>

        <div className="px-8 py-8 space-y-8">
          <div
            className={`relative overflow-hidden rounded-3xl p-10 text-center cursor-pointer transition-all duration-300 ${
              dragActive
                ? 'border-2 border-purple-400 bg-gradient-to-br from-purple-50/90 via-blue-50/90 to-cyan-50/90 dark:from-purple-950/30 dark:via-blue-950/30 dark:to-cyan-950/30 scale-[1.02] shadow-lg shadow-purple-200 dark:shadow-purple-900/20'
                : selectedFile
                ? 'border-2 border-green-400 bg-gradient-to-br from-green-50/90 to-emerald-50/90 dark:from-green-950/30 dark:to-emerald-950/30'
                : 'border-2 border-dashed border-gray-300 dark:border-gray-600 bg-white/70 dark:bg-gray-800/50 hover:border-purple-400 dark:hover:border-purple-500 hover:bg-gray-50 dark:hover:bg-gray-700/30'
            } ${loading || success ? 'pointer-events-none' : ''}`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={handleClick}
          >
            {dragActive && (
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 via-blue-500/10 to-cyan-500/10 animate-pulse" />
            )}

            {dragActive && !loading && !success && (
              <div className="absolute inset-0 border-2 border-purple-500/30 rounded-3xl animate-ping" />
            )}

            <div className={`relative mb-5 transform transition-transform duration-300 hover:scale-110 ${loading ? 'animate-pulse' : ''}`}>
              {success ? (
                <div className="w-20 h-20 mx-auto rounded-2xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center shadow-lg shadow-green-500/30">
                  <CheckCircle2 size={40} className="text-white" />
                </div>
              ) : loading ? (
                <div className="w-20 h-20 mx-auto rounded-2xl bg-gradient-to-br from-purple-500 via-blue-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-purple-500/30">
                  <div className="w-10 h-10 border-4 border-white/30 border-t-white rounded-full animate-spin" />
                </div>
              ) : (
                getFileIcon()
              )}
            </div>

            <div className="relative space-y-2">
              {success ? (
                <>
                  <p className="text-xl font-bold text-gray-900 dark:text-white animate-in fade-in slide-in-from-bottom-2 duration-300">
                    导入成功！
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 animate-in fade-in slide-in-from-bottom-2 duration-500 delay-100">
                    正在打开您的思维导图...
                  </p>
                </>
              ) : loading ? (
                <>
                  <p className="text-xl font-bold text-gray-900 dark:text-white animate-pulse">
                    正在导入...
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    请稍候，我们正在解析您的文件
                  </p>
                </>
              ) : selectedFile ? (
                <>
                  <p className="text-lg font-bold text-gray-900 dark:text-white mb-1">
                    {selectedFile.name}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center justify-center gap-2">
                    <FileUp size={14} className="opacity-60" />
                    {formatFileSize(selectedFile.size)} • {selectedFile.name.split('.').pop()?.toUpperCase()}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
                    点击可重新选择文件
                  </p>
                </>
              ) : (
                <>
                  <p className="text-xl font-bold text-gray-900 dark:text-white mb-1">
                    拖拽文件到这里
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                    或点击选择文件
                  </p>
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-gray-100 dark:bg-gray-800 rounded-full text-xs text-gray-500 dark:text-gray-400">
                    <Sparkles size={10} />
                    支持拖拽上传
                  </div>
                </>
              )}
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept=".xmind,.mm"
              onChange={handleFileSelect}
              className="hidden"
              aria-label="选择文件"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-4 p-5 bg-gradient-to-br from-purple-50/80 to-pink-50/80 dark:from-purple-950/30 dark:to-pink-950/30 rounded-2xl border border-purple-200/60 dark:border-purple-800/40 relative overflow-hidden group hover:shadow-lg hover:shadow-purple-500/10 transition-all duration-300">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500 to-pink-500 opacity-0 group-hover:opacity-[0.03] transition-opacity" />
              <div className="relative w-12 h-12 bg-gradient-to-br from-purple-500 via-fuchsia-500 to-pink-500 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-purple-500/20">
                <FileJson size={20} className="text-white" />
              </div>
              <div className="relative">
                <p className="text-base font-bold text-gray-900 dark:text-white">XMind</p>
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">.xmind 文件</p>
              </div>
            </div>

            <div className="flex items-center gap-4 p-5 bg-gradient-to-br from-blue-50/80 to-indigo-50/80 dark:from-blue-950/30 dark:to-indigo-950/30 rounded-2xl border border-blue-200/60 dark:border-blue-800/40 relative overflow-hidden group hover:shadow-lg hover:shadow-blue-500/10 transition-all duration-300">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-indigo-500 opacity-0 group-hover:opacity-[0.03] transition-opacity" />
              <div className="relative w-12 h-12 bg-gradient-to-br from-blue-500 via-cyan-500 to-teal-500 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-blue-500/20">
                <FileText size={20} className="text-white" />
              </div>
              <div className="relative">
                <p className="text-base font-bold text-gray-900 dark:text-white">FreeMind</p>
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">.mm 文件</p>
              </div>
            </div>
          </div>

          {error && (
            <div className="flex items-start gap-3 p-5 bg-gradient-to-r from-red-50/90 to-orange-50/90 dark:from-red-950/30 dark:to-orange-950/30 border border-red-200/80 dark:border-red-800/50 rounded-2xl animate-in slide-in-from-top-2 fade-in duration-300">
              <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-orange-500 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-red-500/20">
                <AlertCircle size={20} className="text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-red-800 dark:text-red-200">导入失败</p>
                <p className="text-sm text-red-700 dark:text-red-300 mt-1 break-words">{error}</p>
              </div>
            </div>
          )}

          {!selectedFile && !loading && !success && (
            <div className="p-5 bg-gradient-to-r from-gray-50/90 to-slate-50/90 dark:from-gray-800/50 dark:to-slate-800/50 border border-gray-200/80 dark:border-gray-700/50 rounded-2xl relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 to-blue-500/5" />
              <div className="relative">
                <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed flex items-start gap-2">
                  <Sparkles size={16} className="text-purple-500 flex-shrink-0 mt-0.5" />
                  <span>
                    <span className="font-bold text-gray-900 dark:text-white">提示：</span>
                    拖拽上传可以更快地导入您的文件。确保文件格式正确，导入过程会自动解析所有节点和连接。
                  </span>
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
