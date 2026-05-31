import type { ReactNode } from 'react';

type ShapeType = 'rounded' | 'capsule' | 'diamond' | 'oval';

interface NodeShapeProps {
  shape?: ShapeType;
  isSelected: boolean;
  isRoot: boolean;
  children: ReactNode;
}

const shapeClasses: Record<ShapeType, string> = {
  rounded: 'rounded-xl',
  capsule: 'rounded-full',
  diamond: 'rotate-45 rounded-sm',
  oval: 'rounded-[50%]',
};

export function NodeShape({ shape = 'rounded', isSelected, isRoot, children }: NodeShapeProps) {
  const baseClasses = isRoot
    ? 'bg-[var(--mm-root-bg)] text-[var(--mm-root-text)] font-bold shadow-lg px-6 py-3'
    : 'bg-[var(--mm-node-bg)] text-[var(--mm-node-text)] shadow-md px-3 py-1.5 border border-[var(--mm-node-border)]';

  const selectedClasses = isSelected
    ? 'ring-2 ring-[var(--mm-selection)] ring-offset-2 animate-selection-pulse'
    : '';

  const shapeClass = shapeClasses[shape] ?? shapeClasses.rounded;

  return (
    <div
      className={[
        baseClasses,
        selectedClasses,
        shapeClass,
        'transition-all duration-200 relative',
      ].join(' ')}
      style={{ transformOrigin: 'center' }}
    >
      {children}
    </div>
  );
}
