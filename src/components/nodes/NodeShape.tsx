import type { ReactNode } from 'react';

type ShapeType = 'rectangle' | 'rounded' | 'capsule';

interface NodeShapeProps {
  shape?: ShapeType;
  isSelected: boolean;
  isRoot: boolean;
  children: ReactNode;
  styleBackground?: string;
  styleColor?: string;
  showBorder?: boolean;
}

const shapeClasses: Record<ShapeType, string> = {
  rectangle: 'rounded-none',
  rounded: 'rounded-lg',
  capsule: 'rounded-full',
};

export function NodeShape({
  shape = 'rounded',
  isSelected,
  isRoot,
  children,
  styleBackground,
  styleColor,
  showBorder = true,
}: NodeShapeProps) {
  const borderClasses = !isRoot && showBorder ? 'border border-[var(--mm-node-border)]' : '';

  const baseClasses = isRoot
    ? 'bg-[var(--mm-root-bg)] text-[var(--mm-root-text)] font-bold shadow-lg px-8 py-4'
    : `bg-[var(--mm-node-bg)] text-[var(--mm-node-text)] shadow-md px-5 py-2.5 ${borderClasses}`;

  const selectedClasses = isSelected
    ? 'ring-2 ring-[var(--mm-selection)] ring-offset-2 animate-selection-pulse'
    : '';

  const shapeClass = shapeClasses[shape] ?? shapeClasses.rounded;

  const inlineStyle: React.CSSProperties = { transformOrigin: 'center' };
  if (styleBackground) {
    inlineStyle.backgroundColor = styleBackground;
  }
  if (styleColor) {
    inlineStyle.color = styleColor;
  }

  return (
    <div
      className={[
        baseClasses,
        selectedClasses,
        shapeClass,
        'transition-all duration-200 relative',
      ].join(' ')}
      style={inlineStyle}
    >
      {children}
    </div>
  );
}
