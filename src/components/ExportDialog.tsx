import React, { useState } from 'react';
import { X, Download, FileJson, FileText, Type, File, CheckCircle2, AlertCircle, Sparkles } from 'lucide-react';
import { exportXMind } from '../lib/exporters/xmind';
import { exportJSONCanvas } from '../lib/exporters/jsonCanvas';
import { exportMarkdown } from '../lib/exporters/markdown';
import type { ExportFormat } from '../lib/types';

interface ExportDialogProps {
  isOpen: boolean;
  onClose: () => void;
  data: any;
}

interface FormatOption {
  id: ExportFormat;
  name: string;
  extension: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  gradient: string;
  disabled?: boolean;
  badge?: string;
}

export const ExportDialog: React.FC<ExportDialogProps> = ({
  isOpen,
  onClose,
  data,
}) => {
  const [format, setFormat] = useState<ExportFormat>('xmind');
  const [filename, setFilename] = useState('mindmap');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  if (!isOpen) return null;

  const formatOptions: FormatOption[] = [
    {
      id: 'xmind',
      name: 'XMind',
      extension: '.xmind',
      description: '标准 XMind 格式，可在 XMind 软件中打开',
      icon: <FileJson size={24} />,
      color: 'purple',
      gradient: 'from-purple-500 via-fuchsia-500 to-pink-500',
    },
    {
      id: 'jsoncanvas',
      name: 'JSON Canvas',
      extension: '.canvas',
      description: 'Obsidian Canvas 格式，用于可视化笔记',
      icon: <File size={24} />,
      color: 'blue',
      gradient: 'from-blue-500 via-cyan-500 to-teal-500',
    },
    {
      id: 'markdown',
      name: 'Markdown',
      extension: '.md',
      description: '层级 Markdown 格式，适合文档和笔记',
      icon: <Type size={24} />,
      color: 'indigo',
      gradient: 'from-indigo-500 via-violet-500 to-purple-500',
    },
    {
      id: 'freemind',
      name: 'FreeMind',
      extension: '.mm',
      description: 'FreeMind 格式，兼容 MindNode',
      icon: <FileText size={24} />,
      color: 'gray',
      gradient: 'from-gray-400 via-gray-500 to-gray-600',
      disabled: true,
      badge: '即将推出',
    },
  ];

  const selectedFormat = formatOptions.find(opt => opt.id === format);

  const handleExport = async () => {
    if (!filename.trim()) {
      setError('请输入文件名');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const fullFilename = `${filename}${selectedFormat?.extension}`;

      switch (format) {
        case 'xmind':
          await exportXMind(data, fullFilename);
          break;
        case 'jsoncanvas':
          await exportJSONCanvas(data, fullFilename);
          break;
        case 'markdown':
          await exportMarkdown(data, fullFilename);
          break;
        case 'freemind':
          break;
      }

      setSuccess(true);
      setTimeout(() => {
        onClose();
        resetState();
      }, 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : '导出失败');
    } finally {
      setLoading(false);
    }
  };

  const resetState = () => {
    setError(null);
    setSuccess(false);
    setLoading(false);
  };

  const estimatedSize = () => {
    const base = JSON.stringify(data).length;
    let multiplier = 1;
    switch (format) {
      case 'xmind':
        multiplier = 1.5;
        break;
      case 'jsoncanvas':
        multiplier = 1.2;
        break;
      case 'markdown':
        multiplier = 0.8;
        break;
      case 'freemind':
        multiplier = 1.1;
        break;
    }
    const bytes = Math.round(base * multiplier);
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  const getColorClasses = (color: string) => {
    const colors = {
      purple: {
        bg: 'bg-purple-50 dark:bg-purple-950/30',
        border: 'border-purple-200 dark:border-purple-800/50',
        glow: 'shadow-purple-200/50 dark:shadow-purple-500/20',
        text: 'text-purple-600 dark:text-purple-400',
        ring: 'ring-purple-500/30',
      },
      blue: {
        bg: 'bg-blue-50 dark:bg-blue-950/30',
        border: 'border-blue-200 dark:border-blue-800/50',
        glow: 'shadow-blue-200/50 dark:shadow-blue-500/20',
        text: 'text-blue-600 dark:text-blue-400',
        ring: 'ring-blue-500/30',
      },
      indigo: {
        bg: 'bg-indigo-50 dark:bg-indigo-950/30',
        border: 'border-indigo-200 dark:border-indigo-800/50',
        glow: 'shadow-indigo-200/50 dark:shadow-indigo-500/20',
        text: 'text-indigo-600 dark:text-indigo-400',
        ring: 'ring-indigo-500/30',
      },
      gray: {
        bg: 'bg-gray-50 dark:bg-gray-800/50',
        border: 'border-gray-200 dark:border-gray-700/50',
        glow: 'shadow-gray-200/50 dark:shadow-gray-500/20',
        text: 'text-gray-600 dark:text-gray-400',
        ring: 'ring-gray-500/30',
      },
    };
    return colors[color as keyof typeof colors] || colors.gray;
  };

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
      <div className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-2xl rounded-3xl shadow-[0_25px_50px_-12px_rgba(0,0,0,0.25)] dark:shadow-[0_25px_50px_-12px_rgba(0,0,0,0.5)] border border-white/50 dark:border-gray-700/50 max-w-3xl w-full transform transition-all duration-300 animate-in zoom-in-95 fade-in">
        <div className="flex items-center justify-between px-8 py-6 border-b border-gray-100 dark:border-gray-800/50">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 via-fuchsia-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-lg shadow-purple-500/25 animate-in fade-in slide-in-from-left-2 duration-500">
              <Download size={22} className="text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold bg-gradient-to-r from-gray-900 via-gray-700 to-gray-900 dark:from-white dark:via-gray-200 dark:to-white bg-clip-text text-transparent">
                导出文件
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">选择格式并保存您的思维导图</p>
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
          <div>
            <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Sparkles size={16} className="text-purple-500" />
              选择导出格式
            </label>
            <div className="grid grid-cols-2 gap-4">
              {formatOptions.map((option) => {
                const colors = getColorClasses(option.color);
                const isSelected = format === option.id;

                return (
                  <button
                    key={option.id}
                    onClick={() => !option.disabled && setFormat(option.id)}
                    disabled={option.disabled}
                    className={`relative group overflow-hidden rounded-2xl border-2 transition-all duration-300 ${
                      isSelected
                        ? `${colors.border} ${colors.bg} shadow-lg shadow-${colors.glow} scale-[1.02] ring-4 ${colors.ring}`
                        : `border-gray-200 dark:border-gray-700/50 bg-white/70 dark:bg-gray-800/50 hover:border-gray-300 dark:hover:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700/30 hover:shadow-md`
                    } ${option.disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                  >
                    {isSelected && (
                      <div className={`absolute inset-0 bg-gradient-to-r ${option.gradient} opacity-0 dark:opacity-[0.08] pointer-events-none`} />
                    )}

                    {isSelected && (
                      <div className={`absolute top-3 right-3 w-7 h-7 rounded-full bg-gradient-to-br ${option.gradient} flex items-center justify-center shadow-lg animate-in fade-in slide-in-from-top-2 duration-300`}>
                        <CheckCircle2 size={16} className="text-white" />
                      </div>
                    )}

                    {option.badge && (
                      <span className="absolute top-3 right-3 px-2 py-1 text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded-full">
                        {option.badge}
                      </span>
                    )}

                    <div className="relative p-5">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-all duration-300 ${
                        isSelected
                          ? `bg-gradient-to-br ${option.gradient} shadow-lg`
                          : `${colors.bg} ${colors.text} group-hover:scale-110`
                      }`}>
                        {option.icon}
                      </div>

                      <div className="text-left">
                        <div className="flex items-center gap-2 mb-1">
                          <p className={`font-semibold text-base ${
                            isSelected ? 'text-gray-900 dark:text-white' : 'text-gray-700 dark:text-gray-200'
                          }`}>
                            {option.name}
                          </p>
                        </div>
                        <p className={`text-sm font-medium ${colors.text}`}>
                          {option.extension}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-500 mt-1.5 line-clamp-2 leading-relaxed">
                          {option.description}
                        </p>
                      </div>
                    </div>

                    {!option.disabled && !isSelected && (
                      <div className={`absolute inset-0 bg-gradient-to-r ${option.gradient} opacity-0 group-hover:opacity-[0.03] transition-opacity duration-300`} />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-4">
              文件名
            </label>
            <div className="relative group">
              <input
                type="text"
                value={filename}
                onChange={(e) => setFilename(e.target.value)}
                className="w-full px-6 py-4 pr-28 border-2 border-gray-200 dark:border-gray-700/70 rounded-2xl bg-white/70 dark:bg-gray-800/50 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-600 focus:outline-none focus:border-purple-400 dark:focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10 transition-all duration-200 text-base font-medium group-hover:bg-white dark:group-hover:bg-gray-800/70"
                placeholder="输入文件名"
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 px-4 py-2 bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900/40 dark:to-pink-900/40 text-purple-600 dark:text-purple-400 rounded-xl text-sm font-semibold border border-purple-200/50 dark:border-purple-700/50">
                {selectedFormat?.extension}
              </div>
            </div>
          </div>

          {selectedFormat && !selectedFormat.disabled && (
            <div className="flex items-center gap-4 p-5 bg-gradient-to-r from-blue-50/80 via-purple-50/80 to-pink-50/80 dark:from-blue-950/30 dark:via-purple-950/30 dark:to-pink-950/30 border border-blue-200/60 dark:border-blue-800/40 rounded-2xl relative overflow-hidden">
              <div className={`absolute inset-0 bg-gradient-to-r ${selectedFormat.gradient} opacity-0 dark:opacity-[0.05]`} />
              <div className="relative w-12 h-12 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-purple-500/20">
                <Download size={22} className="text-white" />
              </div>
              <div className="relative">
                <p className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                  预计文件大小
                  <span className="text-xs text-gray-500 dark:text-gray-500 font-normal">• {selectedFormat.name}</span>
                </p>
                <p className="text-base text-gray-600 dark:text-gray-400 mt-0.5 font-medium">{estimatedSize()}</p>
              </div>
              <div className="ml-auto">
                <div className="w-8 h-8 rounded-full bg-white/80 dark:bg-gray-800/80 flex items-center justify-center">
                  <Sparkles size={14} className="text-purple-500" />
                </div>
              </div>
            </div>
          )}

          {error && (
            <div className="flex items-start gap-3 p-5 bg-gradient-to-r from-red-50/90 to-orange-50/90 dark:from-red-950/30 dark:to-orange-950/30 border border-red-200/80 dark:border-red-800/50 rounded-2xl animate-in slide-in-from-top-2 fade-in duration-300">
              <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-orange-500 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-red-500/20">
                <AlertCircle size={20} className="text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-red-800 dark:text-red-200">导出失败</p>
                <p className="text-sm text-red-700 dark:text-red-300 mt-1 break-words">{error}</p>
              </div>
            </div>
          )}

          {success && (
            <div className="flex items-start gap-3 p-5 bg-gradient-to-r from-green-50/90 to-emerald-50/90 dark:from-green-950/30 dark:to-emerald-950/30 border border-green-200/80 dark:border-green-800/50 rounded-2xl animate-in slide-in-from-top-2 fade-in duration-300">
              <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-green-500/20">
                <CheckCircle2 size={20} className="text-white" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-green-800 dark:text-green-200">导出成功</p>
                <p className="text-sm text-green-700 dark:text-green-300 mt-1">文件已开始下载</p>
              </div>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4">
            <button
              onClick={() => {
                onClose();
                resetState();
              }}
              disabled={loading}
              className="px-6 py-3.5 bg-gray-100 dark:bg-gray-800/70 text-gray-700 dark:text-gray-300 rounded-2xl hover:bg-gray-200 dark:hover:bg-gray-700/70 transition-all duration-200 font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-md"
            >
              取消
            </button>
            <button
              onClick={handleExport}
              disabled={loading || (selectedFormat?.disabled ?? false)}
              className={`px-8 py-3.5 bg-gradient-to-r from-purple-500 via-fuchsia-500 to-pink-500 hover:from-purple-600 hover:via-fuchsia-600 hover:to-pink-600 text-white rounded-2xl shadow-lg shadow-purple-500/25 hover:shadow-xl hover:shadow-purple-500/35 transition-all duration-200 font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2.5 transform active:scale-[0.98]`}
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2.5 border-white/30 border-t-white rounded-full animate-spin" />
                  导出中...
                </>
              ) : (
                <>
                  <Download size={18} />
                  导出
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
