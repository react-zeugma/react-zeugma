import React, { createContext, useContext, useState, useEffect, useRef, ReactNode } from 'react';
import {
  DndContext,
  useSensor,
  useSensors,
  PointerSensor,
  DragStartEvent,
  DragEndEvent,
  pointerWithin,
} from '@dnd-kit/core';
import { TreeNode, SplitDirection, PaneNode } from '../types';

export interface ZeugmaClassNames {
  pane?: string;
  dropPreview?: string;
  swapPreview?: string;
  dragOverlay?: string;
  resizer?: string;
}

export interface DashboardContextValue {
  layout: TreeNode | null;
  onLayoutChange: (newLayout: TreeNode | null) => void;
  renderPane: (paneId: string) => ReactNode;
  activeId: string | null;
  fullscreenPaneId: string | null;
  classNames: ZeugmaClassNames;
  onRemove?: (paneId: string) => void;
  onFullscreenChange?: (paneId: string | null) => void;
}

export const DashboardContext = createContext<DashboardContextValue | undefined>(undefined);

export const useDashboard = () => {
  const context = useContext(DashboardContext);
  if (!context) {
    throw new Error('useDashboard must be used within a DashboardProvider');
  }
  return context;
};

// Tree Helper: Remove a pane and consolidate the tree
export function removePane(tree: TreeNode | null, idToRemove: string): TreeNode | null {
  if (tree === null) return null;
  if (tree.type === 'pane') {
    return tree.paneId === idToRemove ? null : tree;
  }
  const newFirst = removePane(tree.first, idToRemove);
  const newSecond = removePane(tree.second, idToRemove);
  if (newFirst === null) return newSecond;
  if (newSecond === null) return newFirst;
  return { ...tree, first: newFirst, second: newSecond };
}

// Tree Helper: Insert a pane by splitting an existing target
export function splitPane(
  tree: TreeNode | null,
  targetId: string,
  direction: SplitDirection,
  splitType: 'left' | 'right' | 'top' | 'bottom',
  paneToAdd: string,
): TreeNode | null {
  if (tree === null) return { type: 'pane', paneId: paneToAdd };
  if (tree.type === 'pane') {
    if (tree.paneId === targetId) {
      const addedNode: PaneNode = { type: 'pane', paneId: paneToAdd };
      const originalNode: PaneNode = { type: 'pane', paneId: targetId };
      const isFirst = splitType === 'left' || splitType === 'top';
      return {
        type: 'split',
        direction,
        first: isFirst ? addedNode : originalNode,
        second: isFirst ? originalNode : addedNode,
        splitPercentage: 50,
      };
    }
    return tree;
  }
  return {
    ...tree,
    first: splitPane(tree.first, targetId, direction, splitType, paneToAdd) || tree.first,
    second: splitPane(tree.second, targetId, direction, splitType, paneToAdd) || tree.second,
  };
}

// Tree Helper: Swap two pane positions in the tree
export function swapPanes(tree: TreeNode | null, idA: string, idB: string): TreeNode | null {
  if (tree === null) return null;
  if (tree.type === 'pane') {
    if (tree.paneId === idA) return { ...tree, paneId: idB };
    if (tree.paneId === idB) return { ...tree, paneId: idA };
    return tree;
  }
  return {
    ...tree,
    first: swapPanes(tree.first, idA, idB) || tree.first,
    second: swapPanes(tree.second, idA, idB) || tree.second,
  };
}

// Tree Helper: Add a pane by recursively splitting the rightmost/bottommost pane in the tree
export function addPane(tree: TreeNode | null, paneToAdd: string): TreeNode {
  if (tree === null) {
    return { type: 'pane', paneId: paneToAdd };
  }

  function insert(node: TreeNode, parentDirection: SplitDirection | null): TreeNode {
    if (node.type === 'pane') {
      const direction: SplitDirection = parentDirection === 'row' ? 'column' : 'row';
      return {
        type: 'split',
        direction,
        splitPercentage: 50,
        first: node,
        second: { type: 'pane', paneId: paneToAdd },
      };
    }

    return {
      ...node,
      second: insert(node.second, node.direction),
    };
  }

  return insert(tree, null);
}

/** Cursor-following overlay rendered via portal */
const CursorOverlay: React.FC<{
  activeId: string;
  render: (id: string) => ReactNode;
  className?: string;
}> = ({ activeId, render, className }) => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleMove = (e: PointerEvent) => {
      if (ref.current) {
        ref.current.style.transform = `translate(${e.clientX + 12}px, ${e.clientY + 12}px)`;
      }
    };
    document.addEventListener('pointermove', handleMove);
    return () => document.removeEventListener('pointermove', handleMove);
  }, []);

  return (
    <div
      ref={ref}
      className={className}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        zIndex: 9999,
        pointerEvents: 'none',
      }}
    >
      {render(activeId)}
    </div>
  );
};

interface DashboardProviderProps {
  layout: TreeNode | null;
  onChange: (newLayout: TreeNode | null) => void;
  renderPane: (paneId: string) => ReactNode;
  renderDragOverlay?: (activeId: string) => ReactNode;
  classNames?: ZeugmaClassNames;
  fullscreenPaneId?: string | null;
  onFullscreenChange?: (paneId: string | null) => void;
  onRemove?: (paneId: string) => void;
  children: ReactNode;
}

export const DashboardProvider: React.FC<DashboardProviderProps> = ({
  layout,
  onChange,
  renderPane,
  renderDragOverlay,
  classNames = {},
  fullscreenPaneId = null,
  onFullscreenChange,
  onRemove,
  children,
}) => {
  const [activeId, setActiveId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    }),
  );

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id.toString());
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveId(null);
    const { active, over } = event;
    if (!over) return;

    const draggingId = active.id.toString();
    const overIdStr = over.id.toString();

    // Check for center (swap) drop
    const swapMatch = overIdStr.match(/^drop-center-(.+)$/);
    if (swapMatch) {
      const [, targetId] = swapMatch;
      if (draggingId !== targetId) {
        onChange(swapPanes(layout, draggingId, targetId));
      }
      return;
    }

    // Check for edge (split) drop
    const match = overIdStr.match(/^drop-(left|right|top|bottom)-(.+)$/);
    if (!match) return;

    const [, dropZone, targetId] = match;
    if (draggingId === targetId) return;

    const direction: SplitDirection =
      dropZone === 'left' || dropZone === 'right' ? 'row' : 'column';
    const treeWithoutDragging = removePane(layout, draggingId);

    const newLayout = splitPane(
      treeWithoutDragging,
      targetId,
      direction,
      dropZone as 'left' | 'right' | 'top' | 'bottom',
      draggingId,
    );
    onChange(newLayout);
  };

  return (
    <DashboardContext.Provider
      value={{
        layout,
        onLayoutChange: onChange,
        renderPane,
        activeId,
        fullscreenPaneId,
        classNames,
        onRemove,
        onFullscreenChange,
      }}
    >
      <DndContext
        sensors={sensors}
        collisionDetection={pointerWithin}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        {children}
      </DndContext>
      {activeId && renderDragOverlay && (
        <CursorOverlay
          activeId={activeId}
          render={renderDragOverlay}
          className={classNames.dragOverlay}
        />
      )}
    </DashboardContext.Provider>
  );
};
