import { memo, useState, useCallback } from 'react';
import type { NodeProps, Node } from '@xyflow/react';
import { motion } from 'framer-motion';
import type { MindMapNodeData } from '../../lib/layout/types';
import { NodeShape } from './NodeShape';
import { NodeContent } from './NodeContent';
import { NodeEditor } from './NodeEditor';
import { NodeHandles } from './NodeHandles';

function MindMapNodeComponent({ id, data, selected }: NodeProps<Node<MindMapNodeData>>) {
  const [isEditing, setIsEditing] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const handleDoubleClick = useCallback(() => {
    setIsEditing(true);
  }, []);

  const handleSave = useCallback(
    (text: string) => {
      setIsEditing(false);
      document.dispatchEvent(
        new CustomEvent('mindmap:update-node', { detail: { id, text } }),
      );
    },
    [id],
  );

  const handleCancel = useCallback(() => {
    setIsEditing(false);
  }, []);

  const handleToggleExpand = useCallback(() => {
    document.dispatchEvent(
      new CustomEvent('mindmap:toggle-expand', { detail: { id } }),
    );
  }, [id]);

  const handleAddChild = useCallback(() => {
    document.dispatchEvent(
      new CustomEvent('mindmap:add-child', { detail: { id } }),
    );
  }, [id]);

  return (
    <motion.div
      className="relative cursor-pointer"
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{
        scale: isHovered ? 1.03 : 1,
        opacity: 1,
      }}
      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
      onDoubleClick={handleDoubleClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      whileTap={{ scale: 0.98 }}
    >
      <NodeShape
        shape={data.style?.borderStyle === 'capsule' ? 'capsule' : 'rounded'}
        isSelected={!!selected}
        isRoot={data.level === 0}
      >
        {isEditing ? (
          <NodeEditor
            initialText={data.text}
            level={data.level}
            onSave={handleSave}
            onCancel={handleCancel}
          />
        ) : (
          <NodeContent
            text={data.text}
            level={data.level}
            image={data.image}
            note={data.note}
          />
        )}
      </NodeShape>
      <NodeHandles
        hasChildren={data.hasChildren}
        expanded={data.expanded}
        isSelected={!!selected}
        onToggleExpand={handleToggleExpand}
        onAddChild={handleAddChild}
      />
    </motion.div>
  );
}

export const MindMapNode = memo(MindMapNodeComponent);
