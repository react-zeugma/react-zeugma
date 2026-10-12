import React from 'react'
import { RenderCounterFooter } from 'react-zeugma/devtools'
import { FileExplorer } from './FileExplorer'
import { TerminalWidget } from './TerminalWidget'
import { InspectorWidget } from './InspectorWidget'
import { ReadmeWidget } from './ReadmeWidget'
import { SyntaxCode } from '../syntax-code'
import { FILES } from '../mock-files'

export interface IDEWidgetProps {
  tabId: string
  onOpenFile: (filename: string) => void
}

export const IDEWidget = React.memo(function IDEWidget({ tabId, onOpenFile }: IDEWidgetProps) {
  const getContent = () => {
    if (tabId === 'explorer') {
      return <FileExplorer onOpenFile={onOpenFile} />
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

  return (
    <RenderCounterFooter
      id={`content-${tabId}`}
      label={`View: ${tabId}`}
      className="h-full w-full flex flex-col overflow-hidden min-h-0"
      footerClassName="grafana-widget-footer"
    >
      {getContent()}
    </RenderCounterFooter>
  )
})

export { IDEWidget as TabContentWrapper }
