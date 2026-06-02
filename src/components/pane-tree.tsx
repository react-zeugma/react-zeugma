import React, { useRef } from 'react';
import { useDashboard } from './dashboard-provider';
import { TreeNode, SplitNode } from '../types';

interface PaneTreeProps {
  tree?: TreeNode | null;
  /** Size of the resizer in pixels (default 4) */
  resizerSize?: number;
}

function updateSplitPercentage(
  tree: TreeNode | null,
  target: SplitNode,
  newPercentage: number,
): TreeNode | null {
  if (tree === null) return null;
  if (tree === target) {
    return { ...tree, splitPercentage: newPercentage } as SplitNode;
  }
  if (tree.type === 'split') {
    return {
      ...tree,
      first: updateSplitPercentage(tree.first, target, newPercentage) || tree.first,
      second: updateSplitPercentage(tree.second, target, newPercentage) || tree.second,
    };
  }
  return tree;
}

export const PaneTree: React.FC<PaneTreeProps> = ({ tree, resizerSize = 4 }) => {
  const { layout, onLayoutChange, renderPane, fullscreenPaneId, classNames } = useDashboard();
  const containerRef = useRef<HTMLDivElement>(null);

  // Fullscreen bypass
  if (fullscreenPaneId && !tree) {
    return (
      <div style={{ width: '100%', height: '100%', position: 'relative' }}>
        {renderPane(fullscreenPaneId)}
      </div>
    );
  }

  const currentNode = tree !== undefined ? tree : layout;

  if (!currentNode) return null;

  if (currentNode.type === 'pane') {
    return (
      <div style={{ width: '100%', height: '100%', position: 'relative' }}>
        {renderPane(currentNode.paneId)}
      </div>
    );
  }

  const { direction, first, second, splitPercentage } = currentNode;
  const isRow = direction === 'row';

  const handlePointerDown = (e: React.PointerEvent) => {
    e.preventDefault();
    const container = containerRef.current;
    if (!container) return;

    document.body.classList.add('zeugma-resizing');

    const rect = container.getBoundingClientRect();
    const startX = e.clientX;
    const startY = e.clientY;
    const startPercentage = splitPercentage;

    const handlePointerMove = (moveEvent: PointerEvent) => {
      const delta = isRow
        ? ((moveEvent.clientX - startX) / rect.width) * 100
        : ((moveEvent.clientY - startY) / rect.height) * 100;
      const newPercentage = Math.max(5, Math.min(95, startPercentage + delta));
      const newLayout = updateSplitPercentage(layout, currentNode, newPercentage);
      onLayoutChange(newLayout);
    };

    const handlePointerUp = () => {
      document.body.classList.remove('zeugma-resizing');
      document.removeEventListener('pointermove', handlePointerMove);
      document.removeEventListener('pointerup', handlePointerUp);
    };

    document.addEventListener('pointermove', handlePointerMove);
    document.addEventListener('pointerup', handlePointerUp);
  };

  return (
    <div
      ref={containerRef}
      style={{
        display: 'flex',
        flexDirection: isRow ? 'row' : 'column',
        width: '100%',
        height: '100%',
        overflow: 'hidden',
      }}
    >
      <div style={{ flex: `${splitPercentage} 1 0%`, overflow: 'hidden' }}>
        <PaneTree tree={first} resizerSize={resizerSize} />
      </div>
      <div
        className={classNames.resizer}
        style={{
          width: isRow ? `${resizerSize}px` : '100%',
          height: isRow ? '100%' : `${resizerSize}px`,
          cursor: isRow ? 'col-resize' : 'row-resize',
          position: 'relative',
          zIndex: 10,
          userSelect: 'none',
          boxSizing: 'border-box',
          flexShrink: 0,
        }}
        onPointerDown={handlePointerDown}
        role="separator"
        aria-valuenow={splitPercentage}
        aria-valuemin={5}
        aria-valuemax={95}
      />
      <div style={{ flex: `${100 - splitPercentage} 1 0%`, overflow: 'hidden' }}>
        <PaneTree tree={second} resizerSize={resizerSize} />
      </div>
    </div>
  );
};
