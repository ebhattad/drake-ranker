import { combine } from '@atlaskit/pragmatic-drag-and-drop/combine'
import { draggable, dropTargetForElements } from '@atlaskit/pragmatic-drag-and-drop/element/adapter'
import { attachClosestEdge } from '@atlaskit/pragmatic-drag-and-drop-hitbox/closest-edge'
import { GripVertical } from 'lucide-react'
import { useEffect, useRef, useState, type ReactNode } from 'react'
import { listContainerId, type Mode, isItemDragData } from '../lib/ranking-dnd'

type ItemRenderer<T> = (item: T, index?: number, compact?: boolean, dragging?: boolean) => ReactNode

type ListRankerProps<T extends { id: string }> = {
  items: T[]
  renderItem: ItemRenderer<T>
  getItemLabel: (item: T) => string
  emptyMessage: string
  label: string
  mode: Mode
  activeItemId?: string | null
}

type SortableRowProps<T extends { id: string }> = {
  item: T
  index: number
  renderItem: ItemRenderer<T>
  getItemLabel: (item: T) => string
  mode: Mode
  dragging: boolean
}

function SortableRow<T extends { id: string }>({
  item,
  index,
  renderItem,
  getItemLabel,
  mode,
  dragging,
}: SortableRowProps<T>) {
  const rowRef = useRef<HTMLDivElement | null>(null)
  const handleRef = useRef<HTMLButtonElement | null>(null)

  useEffect(() => {
    const element = rowRef.current
    const handle = handleRef.current
    if (!element || !handle) return

    return combine(
      draggable({
        element,
        dragHandle: handle,
        getInitialData: () => ({
          kind: 'item',
          mode,
          view: 'list',
          containerId: listContainerId,
          itemId: item.id,
          index,
        }),
      }),
      dropTargetForElements({
        element,
        getData: ({ input, element }) =>
          attachClosestEdge(
            {
              kind: 'item',
              mode,
              view: 'list',
              containerId: listContainerId,
              itemId: item.id,
              index,
            },
            { input, element, allowedEdges: ['top', 'bottom'] },
          ),
        canDrop: ({ source }) => isItemDragData(source.data) && source.data.mode === mode,
      }),
    )
  }, [index, item.id, mode])

  return (
    <div ref={rowRef} className={dragging ? 'z-20 opacity-70' : ''}>
      <div className="relative">
        <button
          ref={handleRef}
          type="button"
          aria-label={`Drag ${getItemLabel(item)}`}
          className="absolute right-3 top-3 z-10 flex h-10 w-10 touch-none items-center justify-center rounded-none bg-card/75 text-ice/65 shadow-[0_10px_24px_rgba(0,0,0,0.22)] transition hover:text-frost"
        >
          <GripVertical size={18} />
        </button>
        {renderItem(item, index, false, dragging)}
      </div>
    </div>
  )
}

export function ListRanker<T extends { id: string }>({
  items,
  renderItem,
  getItemLabel,
  emptyMessage,
  label,
  mode,
  activeItemId,
}: ListRankerProps<T>) {
  const sectionRef = useRef<HTMLElement | null>(null)
  const [isOver, setIsOver] = useState(false)

  useEffect(() => {
    const element = sectionRef.current
    if (!element) return

    return dropTargetForElements({
      element,
      getData: () => ({
        kind: 'container',
        mode,
        view: 'list',
        containerId: listContainerId,
        index: items.length,
      }),
      canDrop: ({ source }) => isItemDragData(source.data) && source.data.mode === mode,
      onDragEnter: () => setIsOver(true),
      onDragLeave: () => setIsOver(false),
      onDrop: () => setIsOver(false),
    })
  }, [items.length, mode])

  return (
    <section
      ref={sectionRef}
      className={`rounded-none p-4 transition md:p-5 ${
        isOver ? 'bg-card/10 shadow-[0_0_28px_rgba(200,146,74,0.08)]' : 'bg-card/35 shadow-[0_24px_70px_rgba(0,0,0,0.28)]'
      }`}
    >
      <div className="mb-4 flex items-center justify-between gap-3 pb-4">
        <div>
          <p className="text-xs uppercase tracking-[0.38em] text-amber/60">Ranking Area</p>
          <h3 className="mt-2 max-w-[14ch] text-balance font-display text-[clamp(1.4rem,2.5vw,2rem)] leading-[1.02] text-frost">
            Ordered {label}
          </h3>
        </div>
        <div className="whitespace-nowrap rounded-none bg-card/70 px-4 py-2 text-sm text-ice/65 shadow-[0_10px_24px_rgba(0,0,0,0.18)]">
          {items.length} ranked
        </div>
      </div>

      <div className={items.length ? 'space-y-3' : ''}>
        {items.length ? (
          items.map((item, index) => (
            <SortableRow
              key={item.id}
              item={item}
              index={index}
              renderItem={renderItem}
              getItemLabel={getItemLabel}
              mode={mode}
              dragging={activeItemId === item.id}
            />
          ))
        ) : (
          <div className="flex min-h-[320px] items-center justify-center rounded-none bg-card/50 p-10 text-center shadow-[0_18px_48px_rgba(0,0,0,0.2)]">
            <div>
              <p className="max-w-[12ch] text-balance font-display text-3xl text-frost md:text-4xl">Drag here to rank</p>
              <p className="mx-auto mt-3 max-w-[24ch] text-pretty text-sm text-ice/65 md:text-base">{emptyMessage} ↗</p>
            </div>
          </div>
        )}
      </div>
    </section>
  )
}
