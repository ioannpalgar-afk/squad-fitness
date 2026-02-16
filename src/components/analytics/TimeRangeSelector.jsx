const RANGES = [
  { key: 'week', label: '7d' },
  { key: 'month', label: '1m' },
  { key: 'year', label: '1a' },
  { key: 'all', label: '∞' },
]

export default function TimeRangeSelector({ selected, onChange, color = '#00F0FF' }) {
  return (
    <div className="flex gap-1 rounded-lg bg-bg-secondary p-0.5">
      {RANGES.map(r => (
        <button
          key={r.key}
          onClick={() => onChange(r.key)}
          className="rounded-md px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider transition"
          style={selected === r.key
            ? { background: `${color}20`, color }
            : { color: '#555568' }
          }
        >
          {r.label}
        </button>
      ))}
    </div>
  )
}
