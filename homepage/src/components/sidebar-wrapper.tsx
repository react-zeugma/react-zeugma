import React, { useState } from 'react';
import { useDashboard, addPane, removePane } from 'react-zeugma';
import type { TreeNode } from 'react-zeugma';
import { FolderTree, Code2, Globe, Plus, Trash2, RotateCcw, Sparkles } from 'lucide-react';

interface SidebarWrapperProps {
  children: React.ReactNode;
  autoSave: boolean;
  onToggleAutoSave: () => void;
}

interface WidgetMetadata {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string;
}

const AVAILABLE_WIDGETS: WidgetMetadata[] = [
  {
    id: 'explorer',
    title: 'Explorer',
    description: 'Browse and manage files in the project.',
    icon: <FolderTree className="w-4 h-4" />,
    color: 'text-amber-500',
  },
  {
    id: 'editor',
    title: 'Code Editor',
    description: 'Write, format, and edit code.',
    icon: <Code2 className="w-4 h-4" />,
    color: 'text-pink-500',
  },
  {
    id: 'preview',
    title: 'Live Preview',
    description: 'Real-time browser preview.',
    icon: <Globe className="w-4 h-4" />,
    color: 'text-blue-500',
  },
];

const PRESETS: Record<string, { label: string; layout: TreeNode }> = {
  default: {
    label: 'Default Layout',
    layout: {
      type: 'split',
      direction: 'row',
      splitPercentage: 20,
      first: { type: 'pane', paneId: 'explorer' },
      second: {
        type: 'split',
        direction: 'row',
        splitPercentage: 50,
        first: { type: 'pane', paneId: 'editor' },
        second: { type: 'pane', paneId: 'preview' },
      },
    },
  },
  splitScreen: {
    label: 'Split Screen (Editor & Preview)',
    layout: {
      type: 'split',
      direction: 'row',
      splitPercentage: 50,
      first: { type: 'pane', paneId: 'editor' },
      second: { type: 'pane', paneId: 'preview' },
    },
  },
  editorFocus: {
    label: 'Editor Focus',
    layout: { type: 'pane', paneId: 'editor' },
  },
};

// Helper to check if a pane is present in the tree layout
function hasPane(tree: TreeNode | null, id: string): boolean {
  if (!tree) return false;
  if (tree.type === 'pane') {
    return tree.paneId === id;
  }
  return hasPane(tree.first, id) || hasPane(tree.second, id);
}

export function SidebarWrapper({ children, autoSave, onToggleAutoSave }: SidebarWrapperProps) {
  const { layout, onLayoutChange } = useDashboard();
  const [activePreset, setActivePreset] = useState<string>('default');

  const toggleWidget = (id: string, active: boolean) => {
    if (active) {
      const newLayout = removePane(layout, id);
      onLayoutChange(newLayout);
    } else {
      const newLayout = addPane(layout, id);
      onLayoutChange(newLayout);
    }
  };

  const handleApplyPreset = (presetKey: string) => {
    setActivePreset(presetKey);
    onLayoutChange(PRESETS[presetKey].layout);
  };

  const handleReset = () => {
    setActivePreset('default');
    onLayoutChange(PRESETS.default.layout);
  };

  const handleAddRandomWidget = () => {
    const randomId = `random-${Math.floor(100 + Math.random() * 900)}`;
    const newLayout = addPane(layout, randomId);
    onLayoutChange(newLayout);
  };

  return (
    <div className="flex h-full w-full overflow-hidden bg-bg-app transition-colors duration-200">
      {/* Sidebar Panel */}
      <div className="w-64 bg-bg-sidebar border-r border-border-primary flex flex-col shrink-0 z-20 transition-colors duration-200">
        {/* Sidebar Content */}
        <div className="flex-1 overflow-y-auto py-4 px-2 space-y-4">
          {/* Presets and Controls */}
          <div className="space-y-3 px-1">
            <div className="flex items-center gap-1.5 text-text-secondary text-[10px] font-bold uppercase tracking-wider select-none">
              <Sparkles className="w-3 h-3 text-indigo-500" />
              <span>Layout Presets</span>
            </div>
            <div className="flex flex-col gap-2">
              <select
                value={activePreset}
                onChange={(e) => handleApplyPreset(e.target.value)}
                className="w-full bg-bg-pane border border-border-primary hover:border-border-secondary text-text-primary rounded px-2 py-1.5 text-xs font-medium cursor-pointer focus:outline-none focus:border-indigo-500 transition-colors duration-200"
              >
                {Object.entries(PRESETS).map(([key, value]) => (
                  <option key={key} value={key}>
                    {value.label}
                  </option>
                ))}
              </select>

              <div className="flex flex-col gap-1.5">
                <button
                  onClick={handleAddRandomWidget}
                  className="w-full flex items-center justify-center gap-1.5 px-3 py-1.5 rounded bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold border border-indigo-700 hover:border-indigo-600 transition-all cursor-pointer shadow-sm hover:shadow"
                >
                  <Plus className="w-3.5 h-3.5" /> Add Random Widget
                </button>
                <button
                  onClick={handleReset}
                  className="w-full flex items-center justify-center gap-1.5 px-3 py-1.5 rounded bg-bg-pane hover:bg-bg-sidebar text-text-primary text-xs font-medium border border-border-primary hover:border-border-secondary transition-all cursor-pointer shadow-sm"
                >
                  <RotateCcw className="w-3.5 h-3.5" /> Reset Default
                </button>
              </div>

              {/* Auto-Save Toggle */}
              <div className="flex items-center justify-between bg-bg-pane border border-border-primary rounded p-2 text-xs mt-1 select-none transition-colors duration-200">
                <span className="text-text-secondary font-medium">Auto-Save Layout</span>
                <button
                  onClick={onToggleAutoSave}
                  className={`w-9 h-5 rounded-full p-0.5 transition-colors duration-200 focus:outline-none cursor-pointer ${
                    autoSave ? 'bg-indigo-600' : 'bg-text-muted'
                  }`}
                  aria-label="Toggle Auto Save"
                >
                  <div
                    className={`bg-white w-4 h-4 rounded-full shadow transform transition-transform duration-200 ${
                      autoSave ? 'translate-x-4' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            </div>
            <div className="border-b border-border-primary/80 my-3" />
          </div>

          {/* Widgets Header */}
          <div className="text-text-secondary text-[10px] font-bold uppercase tracking-wider select-none px-1">
            <span>Layout Widgets</span>
          </div>

          {/* Widgets List */}
          <div className="space-y-2">
            {AVAILABLE_WIDGETS.map((widget) => {
              const isActive = hasPane(layout, widget.id);
              return (
                <div
                  key={widget.id}
                  className={`flex flex-col rounded-lg border p-2 transition-all duration-200 ${
                    isActive
                      ? 'bg-indigo-500/5 border-indigo-500/25'
                      : 'bg-bg-pane border border-border-primary hover:bg-bg-sidebar hover:border-border-secondary'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <div
                        className={`w-8 h-8 rounded-md flex items-center justify-center shrink-0 ${
                          isActive
                            ? 'bg-indigo-500/10'
                            : 'bg-bg-sidebar border border-border-primary'
                        }`}
                      >
                        <span className={widget.color}>{widget.icon}</span>
                      </div>
                      <div className="truncate">
                        <p className="text-xs font-semibold text-text-primary truncate">
                          {widget.title}
                        </p>
                        <span
                          className={`inline-block text-[9px] font-bold px-1.5 py-0.5 rounded-full ${
                            isActive
                              ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400'
                              : 'bg-bg-sidebar border border-border-primary text-text-secondary'
                          }`}
                        >
                          {isActive ? 'Active' : 'Closed'}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => toggleWidget(widget.id, isActive)}
                      className={`p-1.5 rounded-md cursor-pointer transition-colors ${
                        isActive
                          ? 'hover:bg-rose-500/10 text-text-muted hover:text-rose-500'
                          : 'hover:bg-indigo-500/10 text-text-muted hover:text-indigo-500'
                      }`}
                      title={isActive ? 'Remove Pane' : 'Add Pane'}
                    >
                      {isActive ? (
                        <Trash2 className="w-3.5 h-3.5" />
                      ) : (
                        <Plus className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>

                  <p className="text-[10px] text-text-secondary mt-1.5 leading-relaxed pl-10">
                    {widget.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 min-w-0 h-full relative overflow-hidden bg-bg-app">{children}</div>
    </div>
  );
}
