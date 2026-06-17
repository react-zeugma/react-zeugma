import React from 'react'
import { ChevronDown, Folder, FileCode2 } from 'lucide-react'
import { FILES, FILE_TREE, TreeEntry } from '../mock-files'

interface FileExplorerProps {
  onOpenFile: (fileKey: string) => void
}

export function FileExplorer({ onOpenFile }: FileExplorerProps) {
  const renderTreeNode = (entry: TreeEntry, depth: number = 0): React.ReactNode => {
    const indent = depth * 12
    if (entry.isFolder) {
      const isCollapsed = entry.collapsed
      return (
        <div key={entry.name}>
          <div
            className={`flex items-center gap-1.5 py-1 px-2 rounded text-left transition-all select-none ${
              isCollapsed
                ? 'text-[#6e6e6e] cursor-default'
                : 'text-[#cccccc] hover:bg-[#2d2d2d] cursor-pointer'
            }`}
            style={{ paddingLeft: `${indent + 8}px` }}
          >
            <ChevronDown
              className={`w-3 h-3 shrink-0 transition-transform ${
                isCollapsed ? '-rotate-90 text-[#4e4e4e]' : ''
              }`}
            />
            <Folder
              className={`w-3.5 h-3.5 shrink-0 ${
                isCollapsed ? 'text-[#4e4e4e]' : 'text-[#dcb67a]'
              }`}
            />
            <span
              className={`font-mono text-[11px] truncate ${isCollapsed ? 'text-[#4e4e4e]' : ''}`}
            >
              {entry.name}
            </span>
          </div>
          {!isCollapsed && entry.children?.map((child) => renderTreeNode(child, depth + 1))}
        </div>
      )
    }

    const fileKey = entry.fileKey
    const fileEntry = fileKey ? FILES[fileKey] : null
    const icon = fileEntry?.icon ?? <FileCode2 className="w-3.5 h-3.5 text-zinc-500" />

    return (
      <button
        key={entry.name}
        onClick={() => fileKey && onOpenFile(fileKey)}
        className="flex items-center gap-1.5 py-1 px-2 rounded text-left transition-all hover:bg-[#2d2d2d] hover:text-white cursor-pointer w-full font-mono text-[11px]"
        style={{ paddingLeft: `${indent + 20}px` }}
      >
        {icon}
        <span className="truncate">{entry.name}</span>
      </button>
    )
  }

  return (
    <div className="h-full w-full bg-[#252526] py-3 flex flex-col gap-1 text-xs font-semibold text-[#cccccc] overflow-y-auto">
      <div className="flex items-center gap-1.5 uppercase tracking-wider text-[9px] text-[#858585] font-black select-none px-4 pb-2">
        <ChevronDown className="w-3.5 h-3.5" />
        <span>MY-ZEUGMA-APP</span>
      </div>
      <div className="flex flex-col">{FILE_TREE.map((entry) => renderTreeNode(entry, 0))}</div>
    </div>
  )
}
