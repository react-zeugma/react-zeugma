'use client'

import { useState, useCallback, useEffect, useRef } from 'react'
import { Zeugma, PaneTree, Pane, DragHandle, Tabs, useZeugma, PaneRenderProps } from 'react-zeugma'

import { SyntaxCode } from './syntax-code'
import { FILES, defaultOuterLayout, LAYOUT_PRESETS } from './mock-files'

import { isTabOpenInTree, findActiveEditorPane } from './zeugma-demo-ide/utils'
import { TabContentWrapper } from './zeugma-demo-ide/TabContentWrapper'
import { InspectorWidget } from './zeugma-demo-ide/InspectorWidget'
import { FileExplorer } from './zeugma-demo-ide/FileExplorer'
import { TerminalWidget } from './zeugma-demo-ide/TerminalWidget'
import { ReadmeWidget } from './zeugma-demo-ide/ReadmeWidget'

import { IDETab } from './zeugma-demo-ide/IDETab'
import { IDEDragOverlay } from './zeugma-demo-ide/IDEDragOverlay'
import {
  IDEContainer,
  WindowChrome,
  WorkspaceFrame,
  WorkspaceContent,
  WorkspaceZeugmaArea,
  ActivityBar,
  StatusBar,
  PaneContainer,
  PaneHeader,
  PaneContent,
  PaneControls,
} from './zeugma-demo-ide/IDELayout'

export function ZeugmaDemoIDE({
  className = 'aspect-16/10 min-h-[580px]',
  hideChrome = false,
}: {
  className?: string
  hideChrome?: boolean
}) {
  const [locked, setLocked] = useState(false)
  const [activePreset, setActivePreset] = useState('default')
  const outerZeugma = useZeugma({ initialLayout: defaultOuterLayout })

  const handleReset = () => {
    if (locked) return
    outerZeugma.setLayout(defaultOuterLayout)
    setLocked(false)
    outerZeugma.setLocked(false)
    setActivePreset('default')
  }

  const handlePresetSelect = (presetKey: string) => {
    if (locked) return
    const preset = LAYOUT_PRESETS.find((p) => p.key === presetKey)
    if (preset) {
      outerZeugma.setLayout(preset.layout)
      setActivePreset(presetKey)
    }
  }

  const handleOpenFile = (filename: string) => {
    const isAlreadyOpen = isTabOpenInTree(outerZeugma.layout, filename)
    if (isAlreadyOpen) {
      const pane = outerZeugma.findPaneContainingTab(filename)
      if (pane) outerZeugma.selectTab(pane.id, filename)
    } else {
      const targetPaneId = findActiveEditorPane(outerZeugma.layout)
      if (targetPaneId) {
        outerZeugma.addTab(filename, targetPaneId)
        outerZeugma.selectTab(targetPaneId, filename)
      } else {
        outerZeugma.addTab(filename)
      }
    }
  }

  const handleOpenFileRef = useRef(handleOpenFile)
  useEffect(() => {
    handleOpenFileRef.current = handleOpenFile
  }, [handleOpenFile])

  const stableHandleOpenFile = useCallback((filename: string) => {
    handleOpenFileRef.current(filename)
  }, [])

  // ── Tab content resolution ──────────────────────────────────────────────────
  const renderWidget = useCallback(
    (tabId: string) => {
      const getContent = () => {
        if (tabId === 'explorer') {
          return <FileExplorer onOpenFile={stableHandleOpenFile} />
        }
        if (tabId === 'terminal') {
          return <TerminalWidget />
        }
        if (tabId === 'inspector') {
          return <InspectorWidget />
        }
        if (tabId === 'README.md') {
          return <ReadmeWidget />
        }

        const file = FILES[tabId]
        if (file?.tokens) {
          return <SyntaxCode tokens={file.tokens} language={file.language} />
        }
        return null
      }

      return <TabContentWrapper tabId={tabId}>{getContent()}</TabContentWrapper>
    },
    [stableHandleOpenFile],
  )

  // ── Pane rendering ──────────────────────────────────────────────────────────
  const renderPane = useCallback(
    (paneId: string) => (
      <Pane id={paneId}>
        {(paneProps: PaneRenderProps) => (
          <PaneContainer>
            <PaneHeader>
              <Tabs
                classNames={{
                  container: 'overflow-x-auto scrollbar-none min-w-0 h-full shrink',
                  tab: 'h-full flex',
                }}
                renderTab={(tabProps) => (
                  <IDETab
                    {...tabProps}
                    onSelect={() => paneProps.selectTab(tabProps.tabId)}
                    onRemove={() => paneProps.removeTab(tabProps.tabId)}
                  />
                )}
              />

              <DragHandle className="flex-1 h-full cursor-grab active:cursor-grabbing self-stretch min-w-[20px]" />

              <PaneControls
                isFullscreen={paneProps.isFullscreen}
                onToggleFullscreen={paneProps.toggleFullscreen}
                onRemove={paneProps.remove}
              />
            </PaneHeader>

            <PaneContent>{paneProps.renderActiveTab(renderWidget)}</PaneContent>
          </PaneContainer>
        )}
      </Pane>
    ),
    [locked, renderWidget],
  )

  const renderDragOverlay = useCallback((id: string) => <IDEDragOverlay id={id} />, [])

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <IDEContainer className={className} hideChrome={hideChrome}>
      <WindowChrome hideChrome={hideChrome} />

      <WorkspaceFrame>
        <WorkspaceContent>
          <ActivityBar />

          <WorkspaceZeugmaArea>
            {outerZeugma.layout && (
              <Zeugma
                {...outerZeugma}
                renderDragOverlay={renderDragOverlay}
                classNames={{
                  dropPreview:
                    'bg-zinc-800/50 border border-zinc-700 transition-all duration-200 shadow-lg',
                  rootDropPreview: 'zeugma-root-drop-preview',
                  resizer: 'zeugma-resizer',
                  tabDropPreview: 'zeugma-tab-drop-preview',
                }}
              >
                <PaneTree resizerSize={4} renderPane={renderPane} />
              </Zeugma>
            )}
          </WorkspaceZeugmaArea>
        </WorkspaceContent>

        <StatusBar
          activePreset={activePreset}
          onSelectPreset={handlePresetSelect}
          locked={locked}
          onToggleLock={() => {
            const nextLock = !locked
            setLocked(nextLock)
            outerZeugma.setLocked(nextLock)
          }}
          onReset={handleReset}
        />
      </WorkspaceFrame>
    </IDEContainer>
  )
}
