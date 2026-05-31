import React, { useState, useEffect } from 'react';
import { Clock, ChevronLeft, ChevronRight, Trash2, FileText } from 'lucide-react';
import { getStorage, type MindMapHistoryItem } from '../lib/storage';

interface HistoryPanelProps {
  isOpen: boolean;
  onToggle: () => void;
  onImport: (data: any) => void;
  isDarkMode: boolean;
}

export const HistoryPanel: React.FC<HistoryPanelProps> = ({
  isOpen,
  onToggle,
  onImport,
  isDarkMode,
}) => {
  const [history, setHistory] = useState<MindMapHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      setLoading(true);
      const historyData = await getStorage().getHistory();
      setHistory(historyData);
    } catch (error) {
      console.error('Failed to load history:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    try {
      await getStorage().deleteFromHistory(id);
      await loadHistory();
    } catch (error) {
      console.error('Failed to delete history item:', error);
    }
  };

  const handleItemClick = (item: MindMapHistoryItem) => {
    onImport(item.data);
  };

  const formatTimestamp = (timestamp: number): string => {
    const now = Date.now();
    const diff = now - timestamp;

    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) {
      return `${days}天前`;
    } else if (hours > 0) {
      return `${hours}小时前`;
    } else if (minutes > 0) {
      return `${minutes}分钟前`;
    } else {
      return '刚刚';
    }
  };

  const formatFullTimestamp = (timestamp: number): string => {
    const date = new Date(timestamp);
    return date.toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <>
      <button
        onClick={onToggle}
        className="fixed left-4 top-1/2 transform -translate-y-1/2 z-50 p-3 rounded-xl shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        style={{
          backgroundColor: isDarkMode ? 'rgba(31, 41, 55, 0.95)' : 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          border: isDarkMode ? '1px solid rgba(55, 65, 81, 0.5)' : '1px solid rgba(229, 231, 235, 0.8)',
        }}
        title={isOpen ? '收起历史记录' : '展开历史记录'}
        aria-label={isOpen ? '收起历史记录' : '展开历史记录'}
      >
        {isOpen ? (
          <ChevronLeft size={20} className={isDarkMode ? 'text-gray-300' : 'text-gray-600'} />
        ) : (
          <ChevronRight size={20} className={isDarkMode ? 'text-gray-300' : 'text-gray-600'} />
        )}
      </button>

      <aside
        className={`fixed left-0 top-0 bottom-0 z-40 transition-all duration-300 ease-in-out ${
          isOpen ? 'translate-x-0 opacity-100' : '-translate-x-full opacity-0'
        }`}
        style={{
          width: '320px',
          paddingLeft: isOpen ? '72px' : '0px',
        }}
      >
        <div
          className="h-full w-full overflow-y-auto py-4 pr-4"
          style={{
            backgroundColor: isDarkMode ? 'rgba(31, 41, 55, 0.95)' : 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            borderRight: isDarkMode ? '1px solid rgba(55, 65, 81, 0.5)' : '1px solid rgba(229, 231, 235, 0.8)',
            boxShadow: '4px 0 24px rgba(0, 0, 0, 0.08)',
          }}
        >
          <div className="px-4 mb-4">
            <h2 className="text-lg font-semibold flex items-center gap-2" style={{ color: isDarkMode ? '#E5E7EB' : '#1F2937' }}>
              <Clock size={20} />
              历史记录
            </h2>
            <p className="text-xs mt-1" style={{ color: isDarkMode ? '#9CA3AF' : '#6B7280' }}>
              点击加载思维导图
            </p>
          </div>

          {loading ? (
            <div className="px-4 py-8 text-center">
              <div className="inline-block w-8 h-8 border-2 rounded-full animate-spin" style={{ borderColor: isDarkMode ? '#3B82F6' : '#2563EB', borderTopColor: 'transparent' }}></div>
              <p className="mt-3 text-sm" style={{ color: isDarkMode ? '#9CA3AF' : '#6B7280' }}>加载中...</p>
            </div>
          ) : history.length === 0 ? (
            <div className="px-4 py-12 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-4" style={{ backgroundColor: isDarkMode ? 'rgba(59, 130, 246, 0.1)' : 'rgba(37, 99, 235, 0.1)' }}>
                <FileText size={32} style={{ color: isDarkMode ? '#60A5FA' : '#3B82F6' }} />
              </div>
              <p className="text-sm font-medium mb-1" style={{ color: isDarkMode ? '#E5E7EB' : '#1F2937' }}>暂无历史记录</p>
              <p className="text-xs" style={{ color: isDarkMode ? '#9CA3AF' : '#6B7280' }}>保存的思维导图将显示在这里</p>
            </div>
          ) : (
            <ul className="space-y-2 px-4">
              {history.map((item) => (
                <li
                  key={item.id}
                  onMouseEnter={() => setHoveredItem(item.id)}
                  onMouseLeave={() => setHoveredItem(null)}
                  onClick={() => handleItemClick(item)}
                  className="relative group rounded-xl p-4 cursor-pointer transition-all duration-200"
                  style={{
                    backgroundColor: hoveredItem === item.id
                      ? isDarkMode
                        ? 'rgba(59, 130, 246, 0.15)'
                        : 'rgba(37, 99, 235, 0.08)'
                      : isDarkMode
                        ? 'rgba(75, 85, 99, 0.3)'
                        : 'rgba(243, 244, 246, 0.8)',
                    border: hoveredItem === item.id
                      ? `1px solid ${isDarkMode ? 'rgba(59, 130, 246, 0.4)' : 'rgba(37, 99, 235, 0.3)'}`
                      : isDarkMode
                        ? '1px solid rgba(75, 85, 99, 0.3)'
                        : '1px solid rgba(229, 231, 235, 0.8)',
                    boxShadow: hoveredItem === item.id
                      ? isDarkMode
                        ? '0 4px 12px rgba(0, 0, 0, 0.3)'
                        : '0 4px 12px rgba(0, 0, 0, 0.08)'
                      : 'none',
                  }}
                >
                  <button
                    onClick={(e) => handleDelete(e, item.id)}
                    className={`absolute top-3 right-3 p-1.5 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-red-500 ${
                      hoveredItem === item.id ? 'opacity-100 scale-100' : 'opacity-0 scale-90'
                    }`}
                    style={{
                      backgroundColor: isDarkMode ? 'rgba(239, 68, 68, 0.2)' : 'rgba(239, 68, 68, 0.1)',
                    }}
                    title="删除"
                    aria-label="删除历史记录项"
                  >
                    <Trash2 size={16} className={isDarkMode ? 'text-red-400' : 'text-red-500'} />
                  </button>

                  <h3 className="text-sm font-semibold mb-2 pr-6 truncate" style={{ color: isDarkMode ? '#E5E7EB' : '#1F2937' }}>
                    {item.title || '未命名画布'}
                  </h3>

                  <div className="flex items-center gap-1.5 text-xs" style={{ color: isDarkMode ? '#9CA3AF' : '#6B7280' }}>
                    <Clock size={12} />
                    <span>{formatTimestamp(item.timestamp)}</span>
                    <span className="text-[10px] opacity-60 ml-1">
                      {formatFullTimestamp(item.timestamp)}
                    </span>
                  </div>

                  <div
                    className={`absolute left-0 top-0 bottom-0 w-1 rounded-l-xl transition-all duration-200 ${
                      hoveredItem === item.id ? 'opacity-100' : 'opacity-0'
                    }`}
                    style={{
                      backgroundColor: isDarkMode ? '#3B82F6' : '#2563EB',
                    }}
                  />
                </li>
              ))}
            </ul>
          )}
        </div>
      </aside>

      {isOpen && (
        <div
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-30 md:hidden"
          onClick={onToggle}
          aria-hidden="true"
        />
      )}
    </>
  );
};
