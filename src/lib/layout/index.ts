import type { MindMapNode } from '../types';
import type { LayoutConfig, LayoutResult } from './types';
import { horizontalLayout } from './horizontal';
import { radialLayout } from './radial';
import { balancedLayout } from './balanced';

export type { LayoutAlgorithm, LayoutConfig, LayoutResult, MindMapNodeData, ShapeType } from './types';

/**
 * Compute a React Flow compatible layout for the given mind map tree.
 *
 * Dispatches to the algorithm specified in `config.algorithm`
 * (defaults to `'horizontal'`).
 */
export function computeLayout(
  root: MindMapNode,
  config: LayoutConfig = { algorithm: 'horizontal' },
): LayoutResult {
  const nodeSpacing = config.nodeSpacing ?? 80;
  const levelSpacing = config.levelSpacing ?? 60;

  switch (config.algorithm) {
    case 'radial':
      return radialLayout(root, nodeSpacing, levelSpacing);
    case 'balanced':
      return balancedLayout(root, nodeSpacing, levelSpacing);
    case 'horizontal':
    default:
      return horizontalLayout(root, nodeSpacing, levelSpacing);
  }
}
