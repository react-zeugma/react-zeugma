'use client'

import React, { useState } from 'react'
import { DashboardProvider, PaneTree, Pane, DragHandle, removePane } from 'react-zeugma'
import type { TreeNode, PaneRenderProps } from 'react-zeugma'
import { Code2, Box, FolderTree, Globe } from 'lucide-react'
import { SidebarWrapper } from '../components/sidebar-wrapper'

interface UIPlaceholderProps {
  title: string
  children: React.ReactNode
  icon: React.ReactNode
  isFullscreen: boolean
  toggleFullscreen: () => void
  remove: () => void
}

const UIPlaceholder = ({
  title,
  children,
  icon,
  isFullscreen,
  toggleFullscreen,
  remove,
}: UIPlaceholderProps) => (
  <div className="h-full w-full bg-bg-pane flex flex-col relative overflow-hidden group transition-colors duration-200">
    <DragHandle>
      <div className="px-3 py-2 bg-bg-sidebar border-b border-border-primary flex items-center justify-between cursor-grab active:cursor-grabbing hover:bg-bg-sidebar/95 transition-colors relative select-none">
        <div className="flex items-center gap-2 z-10 pointer-events-none">
          {icon}
          <span className="text-[11px] uppercase tracking-wider text-text-primary font-bold">
            {title}
          </span>
        </div>

        <div
          className="flex gap-1.5 items-center z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
          onPointerDown={(e) => e.stopPropagation()}
        >
          <button
            onClick={toggleFullscreen}
            className="w-2.5 h-2.5 rounded-full bg-text-muted hover:bg-[#27c93f] transition-colors cursor-pointer"
            title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
          />
          <button
            onClick={remove}
            className="w-2.5 h-2.5 rounded-full bg-text-muted hover:bg-[#ff5f56] transition-colors cursor-pointer"
            title="Close Pane"
          />
        </div>
      </div>
    </DragHandle>

    <div className="flex-1 overflow-auto bg-bg-pane-inner text-sm flex flex-col justify-center items-center text-center p-4 transition-colors duration-200">
      {children}
    </div>
  </div>
)

interface WidgetProps {
  isFullscreen: boolean
  toggleFullscreen: () => void
  remove: () => void
}

const ExplorerWidget = (props: WidgetProps) => (
  <UIPlaceholder
    title="Explorer"
    icon={<FolderTree className="w-3.5 h-3.5 text-amber-500" />}
    {...props}
  >
    <div className="flex flex-col items-center justify-center gap-3">
      <FolderTree className="w-8 h-8 text-amber-500 opacity-80" />
      <p className="text-text-secondary text-sm leading-relaxed max-w-sm px-4">
        File Explorer: Browse and manage your workspace file structure. Drag this pane to split and
        rearrange views.
      </p>
    </div>
  </UIPlaceholder>
)

const EditorWidget = (props: WidgetProps) => (
  <UIPlaceholder title="App.tsx" icon={<Code2 className="w-3.5 h-3.5 text-pink-500" />} {...props}>
    <div className="flex flex-col items-center justify-center gap-3">
      <Code2 className="w-8 h-8 text-pink-500 opacity-80" />
      <p className="text-text-secondary text-sm leading-relaxed max-w-sm px-4">
        Code Editor: Write, edit, and refactor source code files with auto-completions and
        formatting.
      </p>
    </div>
  </UIPlaceholder>
)

const PreviewWidget = (props: WidgetProps) => (
  <UIPlaceholder title="Preview" icon={<Globe className="w-3.5 h-3.5 text-blue-500" />} {...props}>
    <div className="flex flex-col items-center justify-center gap-3">
      <Globe className="w-8 h-8 text-blue-500 opacity-80" />
      <p className="text-text-secondary text-sm leading-relaxed max-w-sm px-4">
        Live Preview: View your changes rendered in real-time as you modify files in the editor.
      </p>
    </div>
  </UIPlaceholder>
)

const GenericWidget = ({ title, ...props }: WidgetProps & { title?: string }) => (
  <UIPlaceholder
    title={title || 'Workspace Pane'}
    icon={<Box className="w-3.5 h-3.5 text-indigo-500" />}
    {...props}
  >
    <div className="flex flex-col items-center justify-center gap-3">
      <Box className="w-8 h-8 text-indigo-500 opacity-80" />
      <p className="text-text-secondary text-sm leading-relaxed max-w-sm px-4">
        {title || 'Workspace Pane'}: A dynamically generated layout node. Drag and split to arrange
        it anywhere in your workspace.
      </p>
    </div>
  </UIPlaceholder>
)

const register: Record<string, React.ComponentType<WidgetProps>> = {
  explorer: ExplorerWidget,
  editor: EditorWidget,
  preview: PreviewWidget,
}

const getWidgetDetails = (id: string) => {
  if (id === 'explorer') {
    return {
      title: 'Explorer',
      icon: <FolderTree className="w-3.5 h-3.5 text-amber-500" />,
    }
  }
  if (id === 'editor') {
    return {
      title: 'App.tsx',
      icon: <Code2 className="w-3.5 h-3.5 text-pink-500" />,
    }
  }
  if (id === 'preview') {
    return {
      title: 'Preview',
      icon: <Globe className="w-3.5 h-3.5 text-blue-500" />,
    }
  }
  const isRandom = id.startsWith('random-')
  const title = isRandom ? `Widget #${id.substring(7)}` : `Pane: ${id}`
  return {
    title,
    icon: <Box className="w-3.5 h-3.5 text-indigo-500" />,
  }
}

export function Demo() {
  const defaultIDELayout: TreeNode = {
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
  }

  const [layout, setLayout] = useState<TreeNode | null>(() => {
    if (typeof window === 'undefined') return defaultIDELayout
    const saved = localStorage.getItem('zeugma-demo-layout')
    if (saved) {
      try {
        return JSON.parse(saved)
      } catch {
        // ignore
      }
    }
    return defaultIDELayout
  })

  const [autoSave, setAutoSave] = useState<boolean>(() => {
    if (typeof window === 'undefined') return true
    const savedToggle = localStorage.getItem('zeugma-demo-autosave')
    return savedToggle !== 'false'
  })

  const [fullscreenPaneId, setFullscreenPaneId] = useState<string | null>(null)

  const handleLayoutChange = (newLayout: TreeNode | null) => {
    setLayout(newLayout)
    if (autoSave) {
      if (newLayout) {
        localStorage.setItem('zeugma-demo-layout', JSON.stringify(newLayout))
      } else {
        localStorage.removeItem('zeugma-demo-layout')
      }
    }
  }

  const handleToggleAutoSave = () => {
    const newVal = !autoSave
    setAutoSave(newVal)
    localStorage.setItem('zeugma-demo-autosave', String(newVal))
    if (!newVal) {
      localStorage.removeItem('zeugma-demo-layout')
    } else if (layout) {
      localStorage.setItem('zeugma-demo-layout', JSON.stringify(layout))
    }
  }

  const handleRemove = (paneId: string) => {
    const newLayout = removePane(layout, paneId)
    handleLayoutChange(newLayout)
  }

  const renderPane = (id: string) => {
    return (
      <Pane id={id}>
        {(paneProps: PaneRenderProps) => {
          const WidgetComponent =
            register[id] ||
            ((props: WidgetProps) => {
              const isRandom = id.startsWith('random-')
              const title = isRandom ? `Widget #${id.substring(7)}` : `Pane: ${id}`
              return <GenericWidget title={title} {...props} />
            })

          return (
            <div
              className={`zeugma-pane-container h-full border border-border-primary rounded-lg overflow-hidden shadow-md bg-bg-pane relative transition-all duration-200 ${
                paneProps.isDragging
                  ? 'opacity-30 grayscale pointer-events-none select-none scale-[0.98]'
                  : ''
              }`}
            >
              <WidgetComponent
                isFullscreen={paneProps.isFullscreen}
                toggleFullscreen={paneProps.toggleFullscreen}
                remove={paneProps.remove}
              />
              {paneProps.isDragging && (
                <div className="absolute inset-0 bg-bg-app/40 backdrop-blur-[1px] flex items-center justify-center pointer-events-none select-none z-50">
                  <span className="text-text-secondary font-bold uppercase tracking-wider text-[10px] bg-bg-pane border border-border-primary px-2.5 py-1 rounded shadow-md">
                    Dragging...
                  </span>
                </div>
              )}
            </div>
          )
        }}
      </Pane>
    )
  }

  const renderDragOverlay = (id: string) => {
    const { title, icon } = getWidgetDetails(id)
    return (
      <div className="px-3.5 py-2 bg-bg-sidebar border border-border-secondary rounded-lg shadow-2xl flex items-center gap-2.5 opacity-95 backdrop-blur-md pointer-events-none select-none">
        {icon}
        <span className="text-[11px] uppercase tracking-wider text-text-primary font-bold">
          {title}
        </span>
      </div>
    )
  }

  return (
    <div className="h-[calc(100vh-3.5rem)] bg-bg-app overflow-hidden transition-colors duration-200">
      <h1 className="sr-only">react-zeugma Live Workspace Demo</h1>
      <DashboardProvider
        layout={layout}
        onChange={handleLayoutChange}
        renderPane={renderPane}
        renderDragOverlay={renderDragOverlay}
        fullscreenPaneId={fullscreenPaneId}
        onFullscreenChange={setFullscreenPaneId}
        onRemove={handleRemove}
        classNames={{
          dropPreview:
            'bg-indigo-500/10 backdrop-blur-[2px] border-2 border-dashed border-indigo-400/50 shadow-[0_0_15px_rgba(99,102,241,0.2)] rounded-lg transition-all duration-200',
          swapPreview:
            'bg-amber-500/10 backdrop-blur-[2px] border-2 border-dashed border-amber-400/50 shadow-[0_0_15px_rgba(245,158,11,0.2)] rounded-lg transition-all duration-200',
          resizer:
            'bg-transparent hover:bg-indigo-500/50 active:bg-indigo-500 transition-colors duration-150 z-50',
        }}
      >
        <SidebarWrapper autoSave={autoSave} onToggleAutoSave={handleToggleAutoSave}>
          <div className="h-full w-full p-2 overflow-hidden bg-bg-app">
            {layout ? (
              <PaneTree />
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-text-secondary">
                <p className="mb-4">All panes closed.</p>
                <button
                  onClick={() => handleLayoutChange(defaultIDELayout)}
                  className="px-4 py-2 bg-text-primary hover:bg-text-primary/90 text-bg-app rounded text-sm transition-colors cursor-pointer"
                >
                  Reset Layout
                </button>
              </div>
            )}
          </div>
        </SidebarWrapper>
      </DashboardProvider>
    </div>
  )
}
