import { Check, Copy, Download, Link2, RotateCcw, Share2 } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'

const TIER_LABELS: Record<string, string> = { S: 'S Tier', A: 'A Tier', B: 'B Tier', C: 'C Tier', D: 'D Tier', F: 'F Tier' }

type ExportButtonProps = {
  onExport: () => void
  onShare: () => void
  onReset: () => void
  rankedItems: { title: string }[]
  mode: 'albums' | 'songs'
  viewMode?: 'list' | 'tier'
  tieredItems?: { tier: string; titles: string[] }[]
}

export function ExportButton({ onExport, onShare, onReset, rankedItems, mode, viewMode = 'list', tieredItems }: ExportButtonProps) {
  const [showConfirm, setShowConfirm] = useState(false)
  const [showShare, setShowShare] = useState(false)
  const [copied, setCopied] = useState<'text' | 'url' | null>(null)
  const [toast, setToast] = useState<string | null>(null)
  const menuRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setShowShare(false)
        setShowConfirm(false)
      }
    }

    const handlePointerDown = (event: PointerEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowShare(false)
        setShowConfirm(false)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    document.addEventListener('pointerdown', handlePointerDown)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      document.removeEventListener('pointerdown', handlePointerDown)
    }
  }, [])

  useEffect(() => {
    if (!toast) return

    const timeoutId = window.setTimeout(() => setToast(null), 4000)
    return () => window.clearTimeout(timeoutId)
  }, [toast])

  function textRanking() {
    const label = mode === 'albums' ? 'Drake Album' : 'Drake Song'
    if (viewMode === 'tier' && tieredItems) {
      const lines = tieredItems
        .filter((t) => t.titles.length > 0)
        .map((t) => `${TIER_LABELS[t.tier] ?? t.tier}:\n${t.titles.map((title) => `  ${title}`).join('\n')}`)
      return `My ${label} Tier List ❄️\n\n${lines.join('\n\n')}\n\nRank yours at drakeranker.com`
    }
    const lines = rankedItems.map((item) => item.title)
    return `My ${label} Ranking ❄️\n\n${lines.join('\n')}\n\nRank yours at drakeranker.com`
  }

  async function copyText() {
    await navigator.clipboard.writeText(textRanking())
    setCopied('text')
    setTimeout(() => setCopied(null), 2000)
  }

  async function copyUrl() {
    onShare()
    setCopied('url')
    setTimeout(() => setCopied(null), 2000)
  }

  function shareTwitter() {
    const top3 = rankedItems.slice(0, 3).map((item) => item.title).join(' · ')
    const text = `My top Drake ${mode} ❄️\n\n${top3}\n\nRank yours →`
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`, '_blank')
  }

  async function downloadPng() {
    onExport()
    setShowShare(false)
  }

  function shareInstagram() {
    // Instagram doesn't support web share intents — download PNG then prompt user
    onExport()
    setTimeout(() => {
      setToast('PNG downloaded! Open Instagram and share it as a story or post.')
    }, 800)
    setShowShare(false)
  }

  return (
    <>
      <div ref={menuRef} className="ml-auto flex flex-wrap items-start gap-3">
        <div className="relative">
          <button
            type="button"
            aria-expanded={showShare}
            aria-controls="share-dropdown"
            onClick={() => {
              setShowConfirm(false)
              setShowShare((value) => !value)
            }}
            className="inline-flex items-center gap-2 bg-frost px-4 py-3 text-sm font-semibold text-obsidian shadow-[0_14px_32px_rgba(0,0,0,0.18)] transition hover:bg-white"
          >
            <Share2 size={16} /> Share
          </button>

          {showShare && (
            <div id="share-dropdown" className="absolute right-0 top-full z-50 mt-2 w-[min(92vw,28rem)]">
              <div className="overflow-hidden bg-[rgb(var(--theme-panel)/0.98)] shadow-[0_24px_48px_rgba(0,0,0,0.22)]">
                <div className="px-4 py-3">
                  <p className="font-display text-xl text-frost">Share your ranking</p>
                  <p className="mt-1 text-[9px] uppercase tracking-[0.4em] text-[rgb(var(--theme-muted))]">Dropdown export menu</p>
                </div>

                <div className="max-h-[min(72vh,30rem)] space-y-1 overflow-auto p-1">
                  <button
                    type="button"
                    onClick={copyText}
                    className="flex w-full items-start gap-3 px-4 py-3 text-left transition hover:bg-[rgb(var(--theme-accent)/0.04)]"
                  >
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center bg-[rgb(var(--theme-panel-strong)/0.55)] text-[rgb(var(--theme-muted))]">
                      {copied === 'text' ? <Check size={15} className="text-amber" /> : <Copy size={15} />}
                    </span>
                    <div className="min-w-0">
                      <div className="font-semibold text-frost">{copied === 'text' ? 'Copied!' : 'Copy as text'}</div>
                      <div className="text-[10px] text-[rgb(var(--theme-muted))]">
                        {viewMode === 'tier' ? 'Tier list — paste anywhere' : 'Numbered list — paste anywhere'}
                      </div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={copyUrl}
                    className="flex w-full items-start gap-3 px-4 py-3 text-left transition hover:bg-[rgb(var(--theme-accent)/0.04)]"
                  >
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center bg-[rgb(var(--theme-panel-strong)/0.55)] text-[rgb(var(--theme-muted))]">
                      {copied === 'url' ? <Check size={15} className="text-amber" /> : <Link2 size={15} />}
                    </span>
                    <div className="min-w-0">
                      <div className="font-semibold text-frost">{copied === 'url' ? 'Copied!' : 'Copy share link'}</div>
                      <div className="text-[10px] text-[rgb(var(--theme-muted))]">Let others see your ranking</div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={downloadPng}
                    className="flex w-full items-start gap-3 px-4 py-3 text-left transition hover:bg-[rgb(var(--theme-accent)/0.04)]"
                  >
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center bg-[rgb(var(--theme-panel-strong)/0.55)] text-[rgb(var(--theme-muted))]">
                      <Download size={15} />
                    </span>
                    <div className="min-w-0">
                      <div className="font-semibold text-frost">Download PNG</div>
                      <div className="text-[10px] text-[rgb(var(--theme-muted))]">Save as image</div>
                    </div>
                  </button>

                  <div className="px-4 py-2">
                    <span className="text-[9px] uppercase tracking-[0.4em] text-[rgb(var(--theme-muted))]">Post to</span>
                  </div>

                  <button
                    type="button"
                    onClick={shareTwitter}
                    className="flex w-full items-start gap-3 px-4 py-3 text-left transition hover:bg-[rgb(var(--theme-accent)/0.04)]"
                  >
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center bg-[rgb(var(--theme-panel-strong)/0.55)] text-[rgb(var(--theme-muted))]">
                      𝕏
                    </span>
                    <div className="min-w-0">
                      <div className="font-semibold text-frost">Post to X / Twitter</div>
                      <div className="text-[10px] text-[rgb(var(--theme-muted))]">Your top 3 as a tweet</div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={shareInstagram}
                    className="flex w-full items-start gap-3 px-4 py-3 text-left transition hover:bg-[rgb(var(--theme-accent)/0.04)]"
                  >
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center bg-[rgb(var(--theme-panel-strong)/0.55)] text-[rgb(var(--theme-muted))]">
                      📸
                    </span>
                    <div className="min-w-0">
                      <div className="font-semibold text-frost">Share to Instagram</div>
                      <div className="text-[10px] text-[rgb(var(--theme-muted))]">Downloads PNG — then post as story</div>
                    </div>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="relative">
          <button
            type="button"
            aria-expanded={showConfirm}
            aria-controls="reset-dropdown"
            onClick={() => {
              setShowShare(false)
              setShowConfirm((value) => !value)
            }}
            className="inline-flex items-center gap-2 bg-[rgb(20,20,24)] px-4 py-3 text-sm font-semibold text-ice shadow-[0_14px_32px_rgba(0,0,0,0.18)] transition hover:text-red-400"
          >
            <RotateCcw size={16} /> Reset
          </button>

          {showConfirm && (
            <div id="reset-dropdown" className="absolute right-0 top-full z-50 mt-2 w-[min(92vw,20rem)]">
              <div className="overflow-hidden bg-[rgb(var(--theme-panel)/0.98)] shadow-[0_24px_48px_rgba(0,0,0,0.22)]">
                <div className="px-4 py-3">
                  <p className="font-display text-xl text-frost">Reset your ranking?</p>
                  <p className="mt-1 text-[9px] uppercase tracking-[0.4em] text-[rgb(var(--theme-muted))]">This clears the current board</p>
                </div>

                <div className="space-y-2 p-2">
                  <button
                    type="button"
                    onClick={() => setShowConfirm(false)}
                    className="flex w-full items-center justify-between bg-[rgb(var(--theme-panel-strong)/0.45)] px-4 py-3 text-left text-sm font-semibold text-[rgb(var(--theme-muted))] transition hover:text-frost"
                  >
                    <span>Keep ranking</span>
                    <span className="text-[10px] uppercase tracking-[0.4em] text-[rgb(var(--theme-muted))]">Esc</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowConfirm(false)
                      onReset()
                    }}
                    className="flex w-full items-center justify-between bg-red-500/10 px-4 py-3 text-left text-sm font-semibold text-red-300 transition hover:bg-red-500/15"
                  >
                    <span>Yes, reset</span>
                    <span className="text-[10px] uppercase tracking-[0.4em] text-red-300/70">Clear</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {toast && (
        <div className="fixed bottom-6 left-1/2 z-[60] w-[calc(100%-2rem)] max-w-md -translate-x-1/2 bg-card/95 px-4 py-3 text-frost shadow-[0_20px_40px_rgba(0,0,0,0.45)]">
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm font-medium">{toast}</p>
            <button
              type="button"
              onClick={() => setToast(null)}
              className="bg-[rgb(var(--theme-panel-strong)/0.45)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-ice/65 transition hover:text-frost"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}
    </>
  )
}
