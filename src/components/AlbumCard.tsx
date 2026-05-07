import type { Album } from '../data/discography'

type AlbumCardProps = {
  album: Album
  index?: number
  compact?: boolean
  dragging?: boolean
}

const rankStyle = (i: number) => {
  if (i === 0) return { num: 'text-amber', bar: 'bg-amber/50' }
  if (i === 1) return { num: 'text-frost/80', bar: 'bg-frost/15' }
  if (i === 2) return { num: 'text-frost/65', bar: 'bg-frost/08' }
  return { num: 'text-frost/45', bar: 'bg-frost/05' }
}

export function AlbumCard({ album, index, compact = false, dragging = false }: AlbumCardProps) {
  const rs = typeof index === 'number' ? rankStyle(index) : null
  return (
    <article
      className={`group relative flex items-center gap-4 rounded-none bg-card/90 text-left shadow-lg shadow-black/30 backdrop-blur-sm transition duration-200 overflow-hidden ${
        compact ? 'min-h-[72px] px-3 py-2' : 'min-h-[108px] px-4 py-3.5'
      } ${
        dragging
          ? 'bg-card shadow-[0_0_28px_rgba(200,146,74,0.16)]'
          : 'hover:-translate-y-px hover:bg-card hover:shadow-[0_4px_24px_rgba(0,0,0,0.5)]'
      }`}
    >
      {/* Left accent bar */}
      {rs && !compact && (
        <div className={`absolute left-0 top-0 h-full w-[2px] ${rs.bar}`} />
      )}

      {/* Editorial rank number */}
      {typeof index === 'number' && !compact && (
        <div className={`w-10 shrink-0 text-right font-display tabular-nums leading-none select-none ${compact ? 'text-lg' : 'text-[clamp(2rem,3vw,2.8rem)]'} ${rs!.num}`}>
          {String(index + 1).padStart(2, '0')}
        </div>
      )}

      {/* Cover art */}
      <div
        className={`relative shrink-0 overflow-hidden rounded-none shadow-[0_12px_28px_rgba(0,0,0,0.22)] ${compact ? 'h-12 w-12' : 'h-[72px] w-[72px]'}`}
        style={{ background: `linear-gradient(135deg, ${album.color}, #0a0a0e)` }}
      >
        {album.cover ? (
          <img
            src={album.cover}
            alt={album.title}
            width={compact ? 48 : 72}
            height={compact ? 48 : 72}
            loading="lazy"
            className="absolute inset-0 h-full w-full object-cover"
          />
        ) : (
          <>
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgb(var(--theme-text)/0.12),transparent_50%)]" />
            <div className={`absolute bottom-1.5 left-2 font-display text-frost/80 ${compact ? 'text-base' : 'text-lg'}`}>
              {album.title.slice(0, 1)}
            </div>
          </>
        )}
      </div>

      {/* Text content */}
      <div className="min-w-0 flex-1">
        <h3 className={`truncate text-balance font-display leading-[0.95] text-frost ${compact ? 'text-base' : 'text-[clamp(1.25rem,2vw,1.75rem)]'}`}>
          {album.title}
        </h3>
        {album.subtitle && (
          <p className={`mt-1.5 truncate font-sans text-ice/35 ${compact ? 'text-[9px]' : 'text-[10px]'} uppercase tracking-[0.22em]`}>
            {album.subtitle}
          </p>
        )}
      </div>
    </article>
  )
}
