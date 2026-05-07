import type { Song } from '../data/discography'

type SongCardProps = {
  song: Song
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

export function SongCard({ song, index, compact = false, dragging = false }: SongCardProps) {
  const rs = typeof index === 'number' ? rankStyle(index) : null
  return (
    <article
      className={`group relative flex items-center gap-3 overflow-hidden rounded-none bg-card/90 px-3 text-left shadow-lg shadow-black/25 backdrop-blur-md transition duration-300 ${
        compact ? 'min-h-[76px] py-2.5' : 'min-h-[104px] py-3'
      } ${dragging ? 'bg-card shadow-[0_0_28px_rgba(200,146,74,0.16)]' : 'hover:-translate-y-0.5 hover:bg-card hover:shadow-[0_0_20px_rgba(0,0,0,0.2)]'}`}
    >
      {rs && !compact && (
        <div className={`absolute left-0 top-0 h-full w-[3px] ${rs.bar}`} />
      )}
      {typeof index === 'number' && !compact && (
        <div className={`font-display text-4xl tabular-nums leading-none w-10 text-right shrink-0 select-none ${rs!.num}`}>
          {String(index + 1).padStart(2, '0')}
        </div>
      )}
      <div className={`relative shrink-0 overflow-hidden rounded-none shadow-[0_12px_28px_rgba(0,0,0,0.22)] ${compact ? 'h-11 w-11' : 'h-14 w-14'}`}>
        <img
          src={`/covers/${song.albumId}.jpg`}
          alt={song.albumTitle}
          width={compact ? 44 : 56}
          height={compact ? 44 : 56}
          loading="lazy"
          className="h-full w-full object-cover"
          onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none' }}
        />
      </div>
      <div className="min-w-0 flex-1">
        <h3 className={`truncate text-balance font-display leading-[0.95] text-frost ${compact ? 'text-lg' : 'text-[clamp(1rem,1.6vw,1.15rem)]'}`}>{song.title}</h3>
        {!compact && <p className="mt-1 truncate font-sans text-[10px] uppercase tracking-[0.22em] text-ice/40">{song.albumTitle}</p>}
      </div>
    </article>
  )
}
