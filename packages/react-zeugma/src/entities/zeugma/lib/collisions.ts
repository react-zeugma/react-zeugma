import { CollisionDetection, DroppableContainer, pointerWithin, closestCenter } from '@dnd-kit/core'

export const customCollisionDetection: CollisionDetection = (args) => {
  const activeIdStr = args.active.id.toString()
  const isTabDrag = activeIdStr.startsWith('tab-header-')

  const pointerCollisions = pointerWithin(args)
  // We allow tab-drop colliders for both tab drags and pane drags.
  const filteredCollisions = pointerCollisions

  if (filteredCollisions.length > 0) {
    const sortedCollisions = [...filteredCollisions].sort((a, b) => {
      const aId = a.id.toString()
      const bId = b.id.toString()

      // Prioritize tab drop zones over root/pane drop zones for both tab and pane drags
      const aIsTab = aId.startsWith('tab-drop-')
      const bIsTab = bId.startsWith('tab-drop-')
      if (aIsTab && !bIsTab) return -1
      if (!aIsTab && bIsTab) return 1

      const aIsRoot = aId.startsWith('drop-root-')
      const bIsRoot = bId.startsWith('drop-root-')
      if (aIsRoot && !bIsRoot) return -1
      if (!aIsRoot && bIsRoot) return 1

      return 0
    })
    return sortedCollisions
  }

  if (isTabDrag) {
    const tabDroppables = args.droppableContainers.filter((container: DroppableContainer) =>
      container.id.toString().startsWith('tab-drop-'),
    )
    return closestCenter({ ...args, droppableContainers: tabDroppables })
  }
  return []
}
