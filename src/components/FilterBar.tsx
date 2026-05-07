type FilterBarProps = {
  value: string
  onChange: (value: string) => void
  options: Array<{ value: string; label: string }>
}

export function FilterBar({ value, onChange, options }: FilterBarProps) {
  return (
    <label className="flex flex-col gap-2 text-sm font-medium text-ice md:min-w-72">
      <span className="uppercase tracking-[0.3em] text-amber/65">Song filter</span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="rounded-none bg-card/80 px-4 py-3 text-base text-frost shadow-[0_10px_24px_rgba(0,0,0,0.18)] outline-none transition focus:shadow-[0_0_0_1px_rgba(200,146,74,0.28),0_10px_24px_rgba(0,0,0,0.18)] backdrop-blur-md"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  )
}
