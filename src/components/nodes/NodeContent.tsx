import { StickyNote } from 'lucide-react';

interface NodeContentProps {
  text: string;
  level: number;
  image?: string;
  note?: string;
}

export function NodeContent({ text, level, image, note }: NodeContentProps) {
  const isRoot = level === 0;
  const textClasses = isRoot
    ? 'text-lg font-bold'
    : 'text-sm';

  return (
    <div className="relative flex items-center gap-2">
      {image && (
        <img
          src={image}
          alt={text}
          className="w-14 h-14 object-cover rounded-lg"
          draggable={false}
        />
      )}

      <span className={`${textClasses} whitespace-nowrap select-none`}>
        {text}
      </span>

      {note && (
        <div className="group relative">
          <StickyNote size={14} className="text-amber-500 shrink-0" />
          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 p-3 rounded-lg shadow-lg text-xs min-w-[120px] min-h-[60px] max-w-[200px] max-h-[200px] overflow-y-auto whitespace-normal break-words z-50 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-opacity duration-200 pointer-events-none"
            style={{ background: 'var(--mm-toolbar-bg)', color: 'var(--mm-node-text)', border: '1px solid var(--mm-node-border)' }}
          >
            {note}
          </div>
        </div>
      )}
    </div>
  );
}
