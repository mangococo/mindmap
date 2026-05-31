import { memo } from 'react';
import { getBezierPath, type EdgeProps, type Edge } from '@xyflow/react';
import { motion } from 'framer-motion';

type EdgeData = Record<string, unknown> & {
  branchColor?: string;
};

const AnimatedEdge = memo(
  ({
    id,
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
    data,
    selected,
  }: EdgeProps<Edge<EdgeData>>) => {
    const [edgePath] = getBezierPath({
      sourceX,
      sourceY,
      targetX,
      targetY,
      sourcePosition,
      targetPosition,
    });

    const edgeData = data as EdgeData | undefined;
    const strokeColor = edgeData?.branchColor || 'var(--mm-edge, #94a3b8)';

    return (
      <g>
        {selected && (
          <defs>
            <filter id={`glow-${id}`} x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="4" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>
        )}
        <motion.path
          d={edgePath}
          stroke={strokeColor}
          strokeWidth={selected ? 4 : 3}
          fill="none"
          strokeLinecap="round"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: 0.4, ease: 'easeInOut' }}
          filter={selected ? `url(#glow-${id})` : undefined}
        />
      </g>
    );
  }
);

AnimatedEdge.displayName = 'AnimatedEdge';

export { AnimatedEdge };
