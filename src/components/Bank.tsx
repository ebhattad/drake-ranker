import { draggable, dropTargetForElements } from '@atlaskit/pragmatic-drag-and-drop/element/adapter'
import { Check, ChevronDown, GripVertical, Search } from 'lucide-react'
import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { type ContainerId, type Mode, type ViewMode, isItemDragData } from '../lib/ranking-dnd'

type BankProps<T extends { id: string }> = {
  items: T[]
  renderItem: (item: T, compact?: boolean, dragging?: boolean) => ReactNode
  getItemLabel: (item: T) => string
  title: string
  mode: Mode
  view: ViewMode
  activeItemId?: string | null
  droppableId?: ContainerId
  /** If provided, shows an album filter dropdown */
  albums?: { id: string; title: string }[]
}

function BankItem<T extends { id: string }>({
  item,
  renderItem,
  getItemLabel,
  container,
  mode,
  view,
  index,
  dragging,
}: {
  item: T
  renderItem: (item: T, compact?: boolean, dragging?: boolean) => ReactNode
  getItemLabel: (item: T) => string
  container: ContainerId
  mode: Mode
  view: ViewMode
  index: number
  dragging: boolean
}) {
  const itemRef = useRef<HTMLDivElement | null>(null)
  const handleRef = useRef<HTMLButtonElement | null>(null)

  useEffect(() => {
    const element = itemRef.current
    const handle = handleRef.current
    if (!element || !handle) return

    return draggable({
      element,
      dragHandle: handle,
      getInitialData: () => ({
        kind: 'item',
        mode,
        view,
        containerId: container,
        itemId: item.id,
        index,
      }),
    })
  }, [container, index, item.id, mode, view])

  return (
    <div ref={itemRef} className={dragging ? 'opacity-60' : ''}>
      <div className="relative">
        <button
          type="button"
          ref={handleRef}
          aria-label={`Drag ${getItemLabel(item)}`}
          className="absolute right-2 top-2 z-10 flex h-11 w-11 touch-none items-center justify-center rounded-none bg-card/75 text-ice/65 shadow-[0_10px_24px_rgba(0,0,0,0.22)] transition hover:text-frost"
        >
          <GripVertical size={14} />
        </button>
        {renderItem(item, true, dragging)}
      </div>
    </div>
  )
}

export function Bank<T extends { id: string }>({
  items,
  renderItem,
  getItemLabel,
  title,
  mode,
  view,
  activeItemId,
  droppableId = 'bank',
  albums,
}: BankProps<T>) {
  const [query, setQuery] = useState('')
  const [albumFilter, setAlbumFilter] = useState('all')
  const sectionRef = useRef<HTMLElement | null>(null)
  const [isOver, setIsOver] = useState(false)

  useEffect(() => {
    setQuery('')
    setAlbumFilter('all')
  }, [title])

  const filteredItems = useMemo(() => {
    let result = items
    if (albumFilter !== 'all') {
      result = result.filter((item) => (item as unknown as { albumId?: string }).albumId === albumFilter)
    }
    const normalized = query.trim().toLowerCase()
    if (!normalized) return result
    return result.filter((item) => JSON.stringify(item).toLowerCase().includes(normalized))
  }, [items, query, albumFilter])

  useEffect(() => {
    const element = sectionRef.current
    if (!element) return

    return dropTargetForElements({
      element,
      getData: () => ({
        kind: 'container',
        mode,
        view,
        containerId: droppableId,
        index: filteredItems.length,
      }),
      canDrop: ({ source }) => isItemDragData(source.data) && source.data.mode === mode,
      onDragEnter: () => setIsOver(true),
      onDragLeave: () => setIsOver(false),
      onDrop: () => setIsOver(false),
    })
  }, [droppableId, mode, view, filteredItems.length])

  return (
    <section
      ref={sectionRef}
      className="rounded-none bg-card/70 p-5 shadow-2xl shadow-black/25 backdrop-blur-md"
    >
      <div className="mb-4 flex items-center justify-between gap-3">
        <p className="text-xs uppercase tracking-widest text-ice/65">{title} Bank</p>
        <span className="rounded-none bg-card/50 px-2.5 py-1 text-[11px] uppercase tracking-[0.24em] text-ice/65 shadow-[0_10px_24px_rgba(0,0,0,0.18)]">
          {items.length} unranked
        </span>
      </div>

      <label className="relative mb-3 block">
        <span className="sr-only">Search {title.toLowerCase()}</span>
        <Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ice/65" />
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder={`Search ${title.toLowerCase()}...`}
          aria-label={`Search ${title.toLowerCase()}`}
          className="w-full rounded-none bg-card/55 px-3 py-2 pl-10 text-sm text-frost shadow-[0_10px_24px_rgba(0,0,0,0.18)] outline-none placeholder:text-ice/35 focus:shadow-[0_0_0_1px_rgba(200,146,74,0.28),0_10px_24px_rgba(0,0,0,0.18)]"
        />
      </label>

      {albums && albums.length > 0 && (
        <label className="relative mb-4 block">
          <span className="sr-only">Filter songs by album</span>
          <select
            value={albumFilter}
            onChange={(e) => setAlbumFilter(e.target.value)}
            aria-label="Filter songs by album"
            className="w-full cursor-pointer appearance-none rounded-none bg-card/55 px-3 py-2 pr-10 text-sm text-frost shadow-[0_10px_24px_rgba(0,0,0,0.18)] outline-none focus:shadow-[0_0_0_1px_rgba(200,146,74,0.28),0_10px_24px_rgba(0,0,0,0.18)]"
          >
            <option value="all">All albums</option>
            {albums.map((a) => (
              <option key={a.id} value={a.id}>{a.title}</option>
            ))}
          </select>
          <ChevronDown size={14} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-ice/65" />
        </label>
      )}

        <div
          className={`max-h-[60vh] space-y-2 overflow-y-auto pr-1 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-frost/20 ${
          isOver ? 'rounded-none bg-card/10 p-2 shadow-[0_0_28px_rgba(200,146,74,0.08)]' : ''
        }`}
      >
        {!items.length ? (
          <div className="rounded-none bg-card/30 px-4 py-8 text-center text-ice/65 shadow-[0_18px_48px_rgba(0,0,0,0.2)]">
            <span className="mx-auto mb-2 flex h-9 w-9 items-center justify-center rounded-none bg-card/15 text-frost shadow-[0_0_20px_rgba(200,146,74,0.12)]">
              <Check size={18} strokeWidth={2.5} />
            </span>
            <p>
              All ranked!{' '}
              <span className="inline-flex items-center justify-center rounded-none bg-card/15 px-1.5 py-0.5 text-[0.7rem] font-semibold leading-none text-frost shadow-[0_10px_20px_rgba(0,0,0,0.16)]">
                ✓
              </span>
            </p>
          </div>
        ) : !filteredItems.length ? (
          <div className="rounded-none bg-card/30 px-4 py-8 text-center text-ice/65 shadow-[0_18px_48px_rgba(0,0,0,0.2)]">
            No matches.
          </div>
        ) : (
          filteredItems.map((item, index) => (
            <BankItem
              key={item.id}
              item={item}
              renderItem={renderItem}
              getItemLabel={getItemLabel}
              container={droppableId}
              mode={mode}
              view={view}
              index={index}
              dragging={activeItemId === item.id}
            />
          ))
        )}
      </div>
    </section>
  )
}
