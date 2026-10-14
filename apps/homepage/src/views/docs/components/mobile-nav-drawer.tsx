'use client'

import { useRef, useEffect } from 'react'
import { X } from 'lucide-react'
import { closeDialogWithAnimation, handleDialogLightDismiss } from '@/lib/top-layer'
import { DocsSidebar } from '../sidebar'
import type { SidebarGroupData, SidebarItemData } from '../types'

export interface MobileNavDrawerProps {
  isOpen: boolean
  onClose: () => void
  sidebarGroups: SidebarGroupData[]
  activeChapterId: string
  activeSubsectionId: string
  onSelectChapter: (chapterId: string, subsectionId?: string) => void
  isSectionExpanded: (item: SidebarItemData) => boolean
  toggleExpand: (itemId: string) => void
}

export function MobileNavDrawer({
  isOpen,
  onClose,
  sidebarGroups,
  activeChapterId,
  activeSubsectionId,
  onSelectChapter,
  isSectionExpanded,
  toggleExpand,
}: MobileNavDrawerProps) {
  const dialogRef = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return

    if (isOpen) {
      if (!dialog.open) {
        try {
          dialog.showModal()
        } catch {
          // ignore
        }
      }
    } else if (dialog.open) {
      closeDialogWithAnimation(dialog)
    }
  }, [isOpen])

  const handleClose = () => {
    closeDialogWithAnimation(dialogRef.current).then(onClose)
  }

  return (
    <dialog
      ref={dialogRef}
      closedby="any"
      aria-label="Documentation Navigation Drawer"
      onClick={handleDialogLightDismiss}
      onCancel={(e) => {
        e.preventDefault()
        handleClose()
      }}
      className="ui-dialog drawer-dialog bg-bg-pane border-r border-border-primary shadow-float"
    >
      <div className="flex flex-col h-full w-full bg-bg-pane">
        <div className="flex items-center justify-between p-4 border-b border-border-primary bg-bg-sidebar/50 select-none">
          <span className="eyebrow text-text-primary">Navigation Index</span>
          <button
            onClick={handleClose}
            className="p-1 rounded-lg hover:bg-bg-sidebar text-text-muted hover:text-text-primary transition-colors cursor-pointer"
            aria-label="Close navigation drawer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 overscroll-contain">
          <DocsSidebar
            sidebarGroups={sidebarGroups}
            activeChapterId={activeChapterId}
            activeSubsectionId={activeSubsectionId}
            onSelectChapter={(chapterId, subId) => {
              onSelectChapter(chapterId, subId)
              handleClose()
            }}
            isSectionExpanded={isSectionExpanded}
            toggleExpand={toggleExpand}
          />
        </div>
      </div>
    </dialog>
  )
}
