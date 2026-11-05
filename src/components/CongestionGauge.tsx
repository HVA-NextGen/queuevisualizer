import { getCongestion } from '../lib/congestion'

export function CongestionGauge({ occupancy }: { occupancy: number }) {
  const status = getCongestion(occupancy)
  const angle = Math.PI * (1 - Math.min(occupancy, 100) / 100)
  const x = 200 + 123 * Math.cos(angle)
  const y = 185 - 123 * Math.sin(angle)

  return (
    <svg className="gauge" viewBox="0 0 400 235" role="img" aria-label={`Kuvitteellinen kuormitus ${occupancy} prosenttia: ${status.label}`}>
      <path d="M 45 185 A 155 155 0 0 1 152.1 37.6" fill="none" stroke="#18796a" strokeWidth="22" />
      <path d="M 152.1 37.6 A 155 155 0 0 1 309.6 75.4" fill="none" stroke="#e9ae4e" strokeWidth="22" />
      <path d="M 309.6 75.4 A 155 155 0 0 1 355 185" fill="none" stroke="#bd5361" strokeWidth="22" />
      <path d="M 66 185 A 134 134 0 0 1 334 185" fill="none" stroke="#e7eeec" strokeWidth="1" />
      <line x1="200" y1="185" x2={x} y2={y} stroke="#183f44" strokeWidth="4" strokeLinecap="round" />
      <circle cx="200" cy="185" r="7" fill="#183f44" />
      <text x="200" y="135" textAnchor="middle" className="gauge-value">{occupancy}<tspan className="gauge-percent"> %</tspan></text>
      <text x="200" y="156" textAnchor="middle" className="gauge-caption">ESIMERKKIKUORMITUS</text>
      <text x="44" y="214" textAnchor="middle" className="gauge-tick">0 %</text>
      <text x="356" y="214" textAnchor="middle" className="gauge-tick">100 %</text>
    </svg>
  )
}
