export function Header() {
  return (
    <header className="relative pb-6">
      <div className="flex flex-col gap-3">
        <div>
          <p className="mb-2.5 font-sans text-[9px] uppercase tracking-[0.55em] text-amber/65">
            Drake
          </p>
          <h1 className="max-w-[8ch] text-balance font-display text-[clamp(2rem,6vw,4rem)] leading-[1.08] tracking-[-0.05em] text-frost">
            Discography
          </h1>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <p className="inline-flex items-center bg-[rgb(20,20,24)] px-2.5 py-1 font-sans text-[9px] uppercase tracking-[0.45em] text-amber/70 shadow-[0_10px_24px_rgba(0,0,0,0.18)]">
            ❄ ICEMAN
          </p>
          <p className="font-sans text-[9px] uppercase tracking-[0.35em] text-ice/35">
            Rank the Archive
          </p>
        </div>
      </div>
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-amber/25 to-transparent" />
    </header>
  )
}
