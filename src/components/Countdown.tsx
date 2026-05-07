import { useEffect, useState } from 'react'

// ICEMAN drop: May 15, 2026 12:00 AM EST (UTC-5)
const DROP_DATE = new Date('2026-05-15T05:00:00.000Z')

type TimeLeft = {
  days: number
  hours: number
  minutes: number
  seconds: number
  dropped: boolean
}

function getTimeLeft(): TimeLeft {
  const diff = DROP_DATE.getTime() - Date.now()
  if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0, dropped: true }
  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((diff / (1000 * 60)) % 60),
    seconds: Math.floor((diff / 1000) % 60),
    dropped: false,
  }
}

function pad(n: number) {
  return String(n).padStart(2, '0')
}

export function Countdown() {
  const [time, setTime] = useState<TimeLeft>(getTimeLeft)

  useEffect(() => {
    const interval = setInterval(() => setTime(getTimeLeft()), 1000)
    return () => clearInterval(interval)
  }, [])

  if (time.dropped) {
    return (
      <div className="relative overflow-hidden rounded-none bg-amber/08 px-5 py-3 text-center shadow-[0_18px_48px_rgba(200,146,74,0.08)]">
        <p className="font-display text-xl text-amber">ICEMAN is out now ❄️</p>
      </div>
    )
  }

  return (
    <div className="relative overflow-hidden rounded-none bg-card/85 px-5 py-3 shadow-[0_24px_60px_rgba(0,0,0,0.24)] backdrop-blur-sm">
      <div className="relative flex items-center justify-between gap-4">
        {/* Label */}
        <div className="flex items-center gap-2 shrink-0">
          <p className="hidden font-sans text-[9px] uppercase tracking-[0.45em] text-amber/60 sm:block">
            ICEMAN drops
          </p>
        </div>

        {/* Countdown */}
        <div className="flex items-center gap-3 flex-1 justify-center">
          {[
            { value: time.days, label: 'Days' },
            { value: time.hours, label: 'Hrs' },
            { value: time.minutes, label: 'Min' },
            { value: time.seconds, label: 'Sec' },
          ].map(({ value, label }, i) => (
            <div key={label} className="flex items-center gap-3">
              {i > 0 && (
                <span className="font-display text-xl leading-none text-ice/20">·</span>
              )}
              <div className="flex flex-col items-center">
                <span className="font-display text-2xl tabular-nums leading-none text-frost">
                  {pad(value)}
                </span>
                <span className="mt-0.5 font-sans text-[8px] uppercase tracking-[0.3em] text-ice/35">
                  {label}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Date */}
        <p className="hidden shrink-0 font-sans text-[9px] text-ice/25 sm:block">
          May 15 · 12AM EST
        </p>
      </div>
    </div>
  )
}
