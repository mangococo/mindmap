import { useRef, useEffect, useCallback } from 'react';

interface NodeEditorProps {
  initialText: string;
  initialChar?: string | null;
  level: number;
  onSave: (text: string) => void;
  onCancel: () => void;
}

export function NodeEditor({ initialText, initialChar, level, onSave, onCancel }: NodeEditorProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const isRoot = level === 0;

  const effectiveInitial = initialChar ?? initialText;

  useEffect(() => {
    const input = inputRef.current;
    if (input) {
      input.focus();
      if (initialChar) {
        input.setSelectionRange(input.value.length, input.value.length);
      } else {
        input.select();
      }
    }
  }, []);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      e.stopPropagation();

      if (e.key === 'Enter') {
        e.preventDefault();
        const value = (e.target as HTMLInputElement).value.trim();
        onSave(value || initialText);
      } else if (e.key === 'Escape') {
        e.preventDefault();
        onCancel();
      }
    },
    [onSave, onCancel, initialText],
  );

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
  }, []);

  const handleDoubleClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
  }, []);

  const handleBlur = useCallback(() => {
    const value = inputRef.current?.value.trim();
    onSave(value || initialText);
  }, [onSave, initialText]);

  const textClasses = isRoot
    ? 'text-lg font-bold'
    : 'text-sm';

  const textColor = isRoot
    ? 'var(--mm-root-text)'
    : 'var(--mm-node-text)';

  return (
    <input
      ref={inputRef}
      defaultValue={effectiveInitial}
      onKeyDown={handleKeyDown}
      onMouseDown={handleMouseDown}
      onDoubleClick={handleDoubleClick}
      onBlur={handleBlur}
      className={`bg-transparent border-none outline-none text-center w-full ${textClasses}`}
      style={{ color: textColor }}
    />
  );
}
