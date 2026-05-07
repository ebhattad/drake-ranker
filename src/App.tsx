import { monitorForElements } from '@atlaskit/pragmatic-drag-and-drop/element/adapter'
import { extractClosestEdge } from '@atlaskit/pragmatic-drag-and-drop-hitbox/closest-edge'
import { toPng } from 'html-to-image'
import { Disc3, Music4, Sparkles } from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { AlbumCard } from './components/AlbumCard'
import { Bank } from './components/Bank'
import { Countdown } from './components/Countdown'
import { ExportButton } from './components/ExportButton'
import { Header } from './components/Header'
import { ListRanker } from './components/ListRanker'
import { SongCard } from './components/SongCard'
import { TierRanker } from './components/TierRanker'
import { ViewToggle } from './components/ViewToggle'
import { albums, songs, type Album, type Song } from './data/discography'
import {
  bankContainerId,
  tierIds,
  type ContainerDragData,
  type ItemDragData,
  type Mode,
  type TierId,
  type ViewMode,
  isContainerDragData,
  isItemDragData,
} from './lib/ranking-dnd'

type RankingState = {
  albumOrder: string[]
  songOrder: string[]
  albumTiers: Record<TierId, string[]>
  songTiers: Record<TierId, string[]>
}

const STORAGE_KEY = 'drake-discography-ranking-v2'
const tiers: TierId[] = [...tierIds]
const PAGE_BACKGROUND =
  'radial-gradient(ellipse 90% 35% at 50% 0%, rgb(200 146 74 / 0.06) 0%, transparent 100%), radial-gradient(ellipse 55% 45% at 0% 100%, rgb(255 255 255 / 0.04) 0%, transparent 100%), rgb(5 5 7)'

const defaultState: RankingState = {
  albumOrder: [],
  songOrder: [],
  albumTiers: {
    S: [],
    A: [],
    B: [],
    C: [],
    D: [],
    F: [],
    unranked: albums.map((album) => album.id),
  },
  songTiers: {
    S: [],
    A: [],
    B: [],
    C: [],
    D: [],
    F: [],
    unranked: songs.map((song) => song.id),
  },
}

function normalizeState(candidate: RankingState): RankingState {
  const albumIds = new Set(albums.map((album) => album.id))
  const songIds = new Set(songs.map((song) => song.id))

  const normalizeOrder = (order: string[], validIds: Set<string>) => {
    const seen = new Set<string>()
    return order.filter((id) => validIds.has(id) && !seen.has(id) && seen.add(id))
  }

  const normalizeTiers = (source: Record<TierId, string[]>, validIds: Set<string>, fallback: string[]) => {
    const seen = new Set<string>()
    const base = Object.fromEntries(
      tiers.map((tier) => [
        tier,
        (source[tier] ?? []).filter((id) => validIds.has(id) && !seen.has(id) && seen.add(id)),
      ]),
    ) as Record<TierId, string[]>
    base.unranked = [...base.unranked, ...fallback.filter((id) => !seen.has(id))]
    return base
  }

  return {
    albumOrder: normalizeOrder(candidate.albumOrder, albumIds),
    songOrder: normalizeOrder(candidate.songOrder, songIds),
    albumTiers: normalizeTiers(candidate.albumTiers, albumIds, albums.map((album) => album.id)),
    songTiers: normalizeTiers(candidate.songTiers, songIds, songs.map((song) => song.id)),
  }
}

function isRankingState(candidate: unknown): candidate is RankingState {
  return (
    Boolean(candidate) &&
    typeof candidate === 'object' &&
    Array.isArray((candidate as RankingState).albumOrder) &&
    Array.isArray((candidate as RankingState).songOrder) &&
    Boolean((candidate as RankingState).albumTiers) &&
    Boolean((candidate as RankingState).songTiers)
  )
}

function parseStoredState(value: string): RankingState | null {
  try {
    const parsed = JSON.parse(value)
    if (isRankingState(parsed)) return parsed
  } catch {
    // Keep supporting older localStorage entries that were base64 encoded.
  }

  try {
    const parsed = JSON.parse(decodeURIComponent(atob(value)))
    if (isRankingState(parsed)) return parsed
  } catch {
    return null
  }

  return null
}

function insertVisible(list: string[], visibleSet: Set<string>, itemId: string, targetIndex: number) {
  const filtered = list.filter((id) => id !== itemId)
  const visible = filtered.filter((id) => visibleSet.has(id))
  const clampedIndex = Math.max(0, Math.min(targetIndex, visible.length))
  const anchor = visible[clampedIndex]

  if (!anchor) return [...filtered, itemId]

  const anchorIndex = filtered.indexOf(anchor)
  return [...filtered.slice(0, anchorIndex), itemId, ...filtered.slice(anchorIndex)]
}

function moveTierItem(
  tiersById: Record<TierId, string[]>,
  itemId: string,
  targetTier: TierId,
  targetIndex: number,
  visibleIds: string[],
) {
  const visibleSet = new Set(visibleIds)
  const next = Object.fromEntries((Object.keys(tiersById) as TierId[]).map((tier) => [tier, tiersById[tier].filter((id) => id !== itemId)])) as Record<TierId, string[]>
  next[targetTier] = insertVisible(next[targetTier], visibleSet, itemId, targetIndex)
  return next
}

function App() {
  const [mode, setMode] = useState<Mode>('albums')
  const [view, setView] = useState<ViewMode>('list')
  const [songFilter, setSongFilter] = useState<string>('all')
  const [rankingState, setRankingState] = useState<RankingState>(() => {
    const fromStorage = window.localStorage.getItem(STORAGE_KEY)
    const parsedStorage = fromStorage ? parseStoredState(fromStorage) : null
    return normalizeState(parsedStorage ?? defaultState)
  })
  const [feedback, setFeedback] = useState<string>('')
  const [activeItemId, setActiveItemId] = useState<string | null>(null)
  const exportRef = useRef<HTMLDivElement>(null)

  const albumMap = useMemo(() => new Map(albums.map((album) => [album.id, album])), [])
  const songMap = useMemo(() => new Map(songs.map((song) => [song.id, song])), [])

  const orderedAlbums = useMemo(
    () => rankingState.albumOrder.map((id) => albumMap.get(id)).filter(Boolean) as Album[],
    [albumMap, rankingState.albumOrder],
  )
  const rankedAlbumIds = useMemo(() => new Set(rankingState.albumOrder), [rankingState.albumOrder])
  const bankAlbums = useMemo(() => albums.filter((album) => !rankedAlbumIds.has(album.id)), [rankedAlbumIds])

  const orderedSongs = useMemo(
    () => rankingState.songOrder.map((id) => songMap.get(id)).filter(Boolean) as Song[],
    [rankingState.songOrder, songMap],
  )
  const filteredSongs = useMemo(
    () => orderedSongs.filter((song) => songFilter === 'all' || song.albumId === songFilter),
    [orderedSongs, songFilter],
  )
  const rankedSongIds = useMemo(() => new Set(rankingState.songOrder), [rankingState.songOrder])
  const bankSongs = useMemo(
    () => songs.filter((song) => !rankedSongIds.has(song.id) && (songFilter === 'all' || song.albumId === songFilter)),
    [rankedSongIds, songFilter],
  )

  const bankTierAlbums = useMemo(
    () => rankingState.albumTiers.unranked.map((id) => albumMap.get(id)).filter(Boolean) as Album[],
    [albumMap, rankingState.albumTiers.unranked],
  )
  const bankTierSongs = useMemo(
    () => rankingState.songTiers.unranked
      .map((id) => songMap.get(id))
      .filter((song): song is Song => Boolean(song))
      .filter((song) => songFilter === 'all' || song.albumId === songFilter),
    [rankingState.songTiers.unranked, songFilter, songMap],
  )


  const tierOrder = ['S', 'A', 'B', 'C', 'D', 'F'] as const

  const tieredItems = useMemo(() => {
    const tiersById = mode === 'albums' ? rankingState.albumTiers : rankingState.songTiers
    const itemMap = mode === 'albums' ? albumMap : (songMap as Map<string, { title: string }>)
    return tierOrder.map((tier) => ({
      tier,
      titles: tiersById[tier].map((id) => itemMap.get(id)?.title ?? '').filter(Boolean),
    }))
  }, [mode, rankingState.albumTiers, rankingState.songTiers, albumMap, songMap])

  useEffect(() => {
    const normalized = normalizeState(rankingState)
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(normalized))
  }, [rankingState])

  useEffect(() => {
    if (!window.location.hash) return
    window.history.replaceState(null, '', `${window.location.pathname}${window.location.search}`)
  }, [])

  useEffect(() => {
    if (!feedback) return
    const timeout = window.setTimeout(() => setFeedback(''), 2200)
    return () => window.clearTimeout(timeout)
  }, [feedback])

  async function handleExport() {
    if (!exportRef.current) return

    try {
      const options = {
        cacheBust: true,
        pixelRatio: 2,
        backgroundColor: '#060d1a',
        fetchRequestInit: { cache: 'force-cache' as RequestCache },
      }
      // First call primes the image cache, second call captures correctly
      await toPng(exportRef.current, options)
      const dataUrl = await toPng(exportRef.current, options)
      const link = document.createElement('a')
      link.download = `drake-ranking-${mode}-${view}.png`
      link.href = dataUrl
      link.click()
      setFeedback('PNG exported.')
    } catch {
      setFeedback('Export failed.')
    }
  }

  async function handleShare() {
    const url = `${window.location.origin}${window.location.pathname}${window.location.search}`
    try {
      await navigator.clipboard.writeText(url)
      setFeedback('App link copied.')
    } catch {
      setFeedback('Copy failed.')
    }
  }

  function handleReset() {
    setRankingState(defaultState)
    setSongFilter('all')
    setFeedback('Ranking reset.')
  }

  function getVisibleListIds(current: RankingState, itemMode: Mode) {
    if (itemMode === 'albums') {
      return current.albumOrder
    }

    const currentOrderedSongs = current.songOrder.map((id) => songMap.get(id)).filter(Boolean) as Song[]
    return currentOrderedSongs.filter((song) => songFilter === 'all' || song.albumId === songFilter).map((song) => song.id)
  }

  function getVisibleTierIds(itemMode: Mode) {
    if (itemMode === 'albums') {
      return albums.map((album) => album.id)
    }

    return songs.filter((song) => songFilter === 'all' || song.albumId === songFilter).map((song) => song.id)
  }

  function getTargetIndex(target: ItemDragData | ContainerDragData) {
    if (isItemDragData(target)) {
      const edge = extractClosestEdge(target)
      return target.index + (edge === 'bottom' ? 1 : 0)
    }

    return target.index
  }

  function handleDrop(source: ItemDragData, target: ItemDragData | ContainerDragData) {
    if (source.mode !== target.mode || source.view !== target.view) {
      return
    }

    if (source.view === 'list') {
      setRankingState((current) => {
        if (source.mode === 'albums') {
          if (target.containerId === bankContainerId) {
            return {
              ...current,
              albumOrder: current.albumOrder.filter((id) => id !== source.itemId),
            }
          }

          const visibleIds = getVisibleListIds(current, source.mode)
          const targetIndex = getTargetIndex(target)
          return {
            ...current,
            albumOrder: insertVisible(current.albumOrder, new Set(visibleIds), source.itemId, targetIndex),
          }
        }

        if (target.containerId === bankContainerId) {
          return {
            ...current,
            songOrder: current.songOrder.filter((id) => id !== source.itemId),
          }
        }

        const visibleIds = getVisibleListIds(current, source.mode)
        const targetIndex = getTargetIndex(target)
        return {
          ...current,
          songOrder: insertVisible(current.songOrder, new Set(visibleIds), source.itemId, targetIndex),
        }
      })
      return
    }

    setRankingState((current) => {
      if (source.mode === 'albums') {
        const targetIndex = getTargetIndex(target)
        return {
          ...current,
          albumTiers: moveTierItem(current.albumTiers, source.itemId, target.containerId as TierId, targetIndex, getVisibleTierIds(source.mode)),
        }
      }

      const targetIndex = getTargetIndex(target)
      return {
        ...current,
        songTiers: moveTierItem(current.songTiers, source.itemId, target.containerId as TierId, targetIndex, getVisibleTierIds(source.mode)),
      }
    })
  }

  useEffect(() => {
    return monitorForElements({
      canMonitor: ({ source }) => isItemDragData(source.data),
      onDragStart: ({ source }) => {
        if (!isItemDragData(source.data)) return
        setActiveItemId(source.data.itemId)
      },
      onDrop: ({ source, location }) => {
        if (isItemDragData(source.data)) {
          const target = location.current.dropTargets[0]
          if (target && (isItemDragData(target.data) || isContainerDragData(target.data))) {
            handleDrop(source.data, target.data)
          }
        }
        setActiveItemId(null)
      },
    })
  }, [songFilter])

  const summary = mode === 'albums'
    ? `${rankingState.albumTiers.S.length} S-tier album${rankingState.albumTiers.S.length === 1 ? '' : 's'} · ${orderedAlbums.length} ranked`
    : `${rankingState.songTiers.S.length} S-tier song${rankingState.songTiers.S.length === 1 ? '' : 's'} · ${filteredSongs.length} songs visible`

  return (
    <div
      className="min-h-screen text-frost"
      style={{
        background: PAGE_BACKGROUND,
        color: 'rgb(244 244 246)',
      }}
    >
      <div className="mx-auto w-full max-w-7xl px-4 py-5 md:px-6 md:py-8">
        <div className="flex flex-col gap-6 lg:flex-row-reverse lg:items-start">
          <div className="flex min-w-0 flex-1 flex-col gap-4">
            <Countdown />

            {/* Options bar */}
            <div className="relative z-40 flex flex-wrap items-center gap-3 bg-[rgb(14,14,18)] px-4 py-3 shadow-[0_24px_80px_rgba(0,0,0,0.22)] backdrop-blur-md">
              {/* Mode toggle */}
              <div className="inline-flex bg-[rgb(20,20,24)] p-1 shadow-[0_12px_28px_rgba(0,0,0,0.2)]">
                <button
                  type="button"
                  onClick={() => setMode('albums')}
                  className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold transition ${mode === 'albums' ? 'bg-frost text-obsidian shadow-[0_0_18px_rgba(255,255,255,0.12)]' : 'text-ice hover:text-frost'}`}
                >
                  <Disc3 size={15} /> Albums
                </button>
                <button
                  type="button"
                  onClick={() => setMode('songs')}
                  className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold transition ${mode === 'songs' ? 'bg-frost text-obsidian shadow-[0_0_18px_rgba(255,255,255,0.12)]' : 'text-ice hover:text-frost'}`}
                >
                  <Music4 size={15} /> Songs
                </button>
              </div>
              <ViewToggle view={view} onChange={setView} />
              <div className="ml-auto flex items-center gap-3">
                <ExportButton
                  onExport={handleExport}
                  onShare={handleShare}
                  onReset={handleReset}
                  rankedItems={mode === 'albums' ? orderedAlbums : orderedSongs}
                  mode={mode}
                  viewMode={view}
                  tieredItems={tieredItems}
                />
              </div>
            </div>

            <main ref={exportRef} className="relative overflow-hidden rounded-none bg-[rgb(14,16,24)] p-4 shadow-[0_40px_120px_rgba(0,0,0,0.4)] backdrop-blur-sm md:p-6">
              <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgb(200_146_74/0.08),transparent_40%),radial-gradient(ellipse_at_bottom_left,rgb(255_255_255/0.05),transparent_50%)]" />
              <div className="relative">
                <div className="mb-6 flex flex-col gap-4 pb-5 md:flex-row md:items-end md:justify-between">
                  <div>
                    <p className="font-sans text-xs uppercase tracking-[0.42em] text-ice/55">My Drake Ranking</p>
                    <h2 className="mt-2 max-w-[12ch] text-balance font-display text-[clamp(2rem,5vw,4rem)] leading-[1.08] tracking-[-0.05em] text-frost">
                      {mode === 'albums' ? 'Albums' : 'Songs'} · {view === 'list' ? 'List' : 'Tiers'}
                    </h2>
                  </div>
                  <div className="flex items-center gap-3 self-start rounded-none bg-[rgb(20,20,24)] px-4 py-2.5 text-sm text-ice/65 shadow-[0_12px_30px_rgba(0,0,0,0.22)]">
                    <Sparkles size={16} className="text-amber" /> {summary}
                  </div>
                </div>

                {feedback && (
                  <div className="mb-4 inline-flex rounded-none bg-amber/10 px-4 py-2 text-sm text-amber shadow-[0_12px_30px_rgba(200,146,74,0.08)]">
                    {feedback}
                  </div>
                )}

                {mode === 'albums' && view === 'list' && (
                  <ListRanker
                    items={orderedAlbums}
                    renderItem={(album, index, compact, dragging) => <AlbumCard album={album} index={index} compact={compact} dragging={dragging} />}
                    getItemLabel={(album) => album.title}
                    emptyMessage="Drag albums here to start ranking"
                    label="albums"
                    mode="albums"
                    activeItemId={activeItemId}
                  />
                )}

                {mode === 'songs' && view === 'list' && (
                  <ListRanker
                    items={filteredSongs}
                    renderItem={(song, index, compact, dragging) => <SongCard song={song} index={index} compact={compact} dragging={dragging} />}
                    getItemLabel={(song) => song.title}
                    emptyMessage="Drag songs here to start ranking"
                    label="songs"
                    mode="songs"
                    activeItemId={activeItemId}
                  />
                )}

                {mode === 'albums' && view === 'tier' && (
                  <TierRanker
                    items={albums}
                    tiers={rankingState.albumTiers}
                    renderItem={(album, _index, compact, dragging) => <AlbumCard album={album} compact={compact} dragging={dragging} />}
                    getItemLabel={(album) => album.title}
                    mode="albums"
                    activeItemId={activeItemId}
                  />
                )}

                {mode === 'songs' && view === 'tier' && (
                  <TierRanker
                    items={songs}
                    tiers={rankingState.songTiers}
                    renderItem={(song, _index, compact, dragging) => <SongCard song={song} compact={compact} dragging={dragging} />}
                    getItemLabel={(song) => song.title}
                    visibleIds={songs.filter((song) => songFilter === 'all' || song.albumId === songFilter).map((song) => song.id)}
                    mode="songs"
                    activeItemId={activeItemId}
                  />
                )}
              </div>
            </main>
          </div>

          <aside className="flex w-full flex-col gap-5 lg:sticky lg:top-8 lg:w-80 xl:w-96">
            <Header />

            {mode === 'albums' ? (
              <Bank
                items={view === 'list' ? bankAlbums : bankTierAlbums}
                title="Albums"
                mode="albums"
                view={view}
                activeItemId={activeItemId}
                droppableId={view === 'list' ? bankContainerId : 'unranked'}
                getItemLabel={(item) => item.title}
                renderItem={(item, compact, dragging) => <AlbumCard album={item} compact={compact} dragging={dragging} />}
              />
            ) : (
              <Bank
                items={view === 'list' ? bankSongs : bankTierSongs}
                title="Songs"
                mode="songs"
                view={view}
                activeItemId={activeItemId}
                droppableId={view === 'list' ? bankContainerId : 'unranked'}
                getItemLabel={(item) => item.title}
                renderItem={(item, compact, dragging) => <SongCard song={item} compact={compact} dragging={dragging} />}
                albums={albums.map((a) => ({ id: a.id, title: a.title }))}
              />
            )}
          </aside>
        </div>
      </div>
    </div>
  )
}

export default App
