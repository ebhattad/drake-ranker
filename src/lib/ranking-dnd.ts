export type Mode = 'albums' | 'songs'
export type ViewMode = 'list' | 'tier'
export type TierId = 'S' | 'A' | 'B' | 'C' | 'D' | 'F' | 'unranked'

export const listContainerId = 'rank-list' as const
export const bankContainerId = 'bank' as const
export const tierIds = ['S', 'A', 'B', 'C', 'D', 'F', 'unranked'] as const

export type ContainerId = typeof listContainerId | typeof bankContainerId | TierId

type DragBaseData = {
  kind: 'item' | 'container'
  mode: Mode
  view: ViewMode
  containerId: ContainerId
}

export type ItemDragData = DragBaseData & {
  kind: 'item'
  itemId: string
  index: number
}

export type ContainerDragData = DragBaseData & {
  kind: 'container'
  index: number
}

export type RankDragData = ItemDragData | ContainerDragData

function hasString(data: Record<string | symbol, unknown>, key: string) {
  return typeof data[key] === 'string'
}

export function isItemDragData(data: Record<string | symbol, unknown>): data is ItemDragData {
  return (
    data.kind === 'item' &&
    hasString(data, 'mode') &&
    hasString(data, 'view') &&
    hasString(data, 'containerId') &&
    hasString(data, 'itemId') &&
    typeof data.index === 'number'
  )
}

export function isContainerDragData(data: Record<string | symbol, unknown>): data is ContainerDragData {
  return (
    data.kind === 'container' &&
    hasString(data, 'mode') &&
    hasString(data, 'view') &&
    hasString(data, 'containerId') &&
    typeof data.index === 'number'
  )
}

export function isRankDragData(data: Record<string | symbol, unknown>): data is RankDragData {
  return isItemDragData(data) || isContainerDragData(data)
}
