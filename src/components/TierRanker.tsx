import { combine } from '@atlaskit/pragmatic-drag-and-drop/combine'
import { draggable, dropTargetForElements } from '@atlaskit/pragmatic-drag-and-drop/element/adapter'
import { attachClosestEdge } from '@atlaskit/pragmatic-drag-and-drop-hitbox/closest-edge'
import { GripVertical } from 'lucide-react'
import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { type Mode, type TierId as SharedTierId, type ViewMode, isItemDragData } from '../lib/ranking-dnd'

export type TierId = SharedTierId

type ItemRenderer<T> = (item: T, index?: number, compact?: boolean, dragging?: boolean) => ReactNode

type TierRankerProps<T extends { id: string }> = {
  items: T[]
  tiers: Record<TierId, string[]>
  renderItem: ItemRenderer<T>
  getItemLabel: (item: T) => string
  visibleIds?: string[]
  mode: Mode
  activeItemId?: string | null
}

type TierMeta = {
  id: Exclude<TierId, 'unranked'>
  label: string
  color: string
  glow: string
}

const tierMeta: TierMeta[] = [
  { id: 'S', label: 'S', color: '#f4ead6', glow: 'rgba(200,146,74,0.14)' },
  { id: 'A', label: 'A', color: '#e2c48e', glow: 'rgba(200,146,74,0.12)' },
  { id: 'B', label: 'B', color: '#c79b5f', glow: 'rgba(200,146,74,0.10)' },
  { id: 'C', label: 'C', color: '#9a7345', glow: 'rgba(154,115,69,0.10)' },
  { id: 'D', label: 'D', color: '#5b4631', glow: 'rgba(91,70,49,0.10)' },
  { id: 'F', label: 'F', color: '#1d1814', glow: 'rgba(29,24,20,0.10)' },
]

function TierDropZone({
  tier,
  children,
  count,
  mode,
}: {
  tier: TierMeta
  children: ReactNode
  count: number
  mode: Mode
}) {
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
        view: 'tier' as ViewMode,
        containerId: tier.id,
        index: count,
      }),
      canDrop: ({ source }) => isItemDragData(source.data) && source.data.mode === mode,
      onDragEnter: () => setIsOver(true),
      onDragLeave: () => setIsOver(false),
      onDrop: () => setIsOver(false),
    })
  }, [count, mode, tier.id])

  return (
    <section
      ref={sectionRef}
      className={`grid gap-4 rounded-none p-3 transition md:grid-cols-[88px_1fr] md:p-4 ${
        isOver ? 'bg-card/10 shadow-[0_0_28px_rgba(200,146,74,0.08)]' : 'bg-card/55'
      }`}
      style={{ boxShadow: `0 18px 60px ${tier.glow}` }}
    >
      <div
        className="flex min-h-[76px] items-center justify-center rounded-none px-4 py-6 font-display text-[clamp(2.2rem,4vw,3.5rem)]"
        style={{ backgroundColor: tier.color, color: tier.id === 'D' || tier.id === 'F' ? '#f4ead6' : '#111111' }}
      >
        <div className="text-center">
          <div>{tier.label}</div>
          <div className="mt-1 whitespace-nowrap font-sans text-[10px] uppercase tracking-[0.25em] opacity-60">{count}</div>
        </div>
      </div>
      <div className="flex min-h-[92px] flex-wrap gap-3">{children}</div>
    </section>
  )
}

function DraggableTile<T extends { id: string }>({
  item,
  renderItem,
  getItemLabel,
  tierId,
  index,
  mode,
  dragging,
}: {
  item: T
  renderItem: ItemRenderer<T>
  getItemLabel: (item: T) => string
  tierId: TierId
  index: number
  mode: Mode
  dragging: boolean
}) {
  const tileRef = useRef<HTMLDivElement | null>(null)
  const handleRef = useRef<HTMLButtonElement | null>(null)

  useEffect(() => {
    const element = tileRef.current
    const handle = handleRef.current
    if (!element || !handle) return

    return combine(
      draggable({
        element,
        dragHandle: handle,
        getInitialData: () => ({
          kind: 'item',
          mode,
          view: 'tier' as ViewMode,
          containerId: tierId,
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
              view: 'tier' as ViewMode,
              containerId: tierId,
              itemId: item.id,
              index,
            },
            { input, element, allowedEdges: ['top', 'bottom'] },
          ),
        canDrop: ({ source }) => isItemDragData(source.data) && source.data.mode === mode,
      }),
    )
  }, [index, item.id, mode, tierId])

  return (
    <div ref={tileRef} className={`dnd-draggable relative w-full sm:w-[calc(50%-0.375rem)] xl:w-[calc(33.333%-0.5rem)] ${dragging ? 'opacity-60' : ''}`}>
      <button
        ref={handleRef}
        type="button"
        aria-label={`Drag ${getItemLabel(item)}`}
        className="absolute right-2 top-2 z-10 flex h-11 w-11 select-none items-center justify-center rounded-none bg-obsidian/55 text-ice/65 shadow-[0_10px_24px_rgba(0,0,0,0.22)]"
      >
        <GripVertical size={18} />
      </button>
      {renderItem(item, undefined, true, dragging)}
    </div>
  )
}

export function TierRanker<T extends { id: string }>({
  items,
  tiers,
  renderItem,
  getItemLabel,
  visibleIds,
  mode,
  activeItemId,
}: TierRankerProps<T>) {
  const visible = visibleIds ?? items.map((item) => item.id)
  const visibleSet = useMemo(() => new Set(visible), [visible])
  const itemMap = useMemo(() => new Map(items.map((item) => [item.id, item])), [items])

  function getVisibleItemsForTier(tier: Exclude<TierId, 'unranked'>) {
    return tiers[tier].filter((id) => visibleSet.has(id)).map((id) => itemMap.get(id)).filter(Boolean) as T[]
  }

  return (
    <div className="space-y-4">
      {tierMeta.map((tier) => {
        const tierItems = getVisibleItemsForTier(tier.id)
        return (
          <TierDropZone key={tier.id} tier={tier} count={tierItems.length} mode={mode}>
            {tierItems.map((item, index) => (
              <DraggableTile
                key={item.id}
                item={item}
                renderItem={renderItem}
                getItemLabel={getItemLabel}
                tierId={tier.id}
                index={index}
                mode={mode}
                dragging={activeItemId === item.id}
              />
            ))}
          </TierDropZone>
        )
      })}
    </div>
  )
}
