import { useId } from 'react'
import type { HistoryPoint } from '../data/demo'
import { formatHour, formatSampleTime } from '../data/demo'

export function HistoryChart({ history }: { history: HistoryPoint[] }) {
  const descriptionId = useId()
  const max = Math.max(100, ...history.map(point => point.occupancy))
  const slotWidth = 920 / history.length
  const coordinates = history.map((point, index) => ({
    x: 55 + (index + 0.5) * slotWidth,
    y: 190 - point.occupancy / max * 160,
  }))

  return (
    <svg className="history-chart" viewBox="0 0 1000 235" role="img" aria-label="Kuvitteellinen 24 tunnin kuormitushistoria pylväskaaviona" aria-describedby={descriptionId}>
      <desc id={descriptionId}>{history.map(point => `${formatSampleTime(point.timestamp)}: ${point.occupancy} %`).join('; ')}</desc>
      {[0, 25, 50, 75, 100].map(value => {
        const y = 190 - value / max * 160
        return <g key={value}><line x1="55" x2="975" y1={y} y2={y} stroke="#e5eceb" strokeDasharray="4 5" /><text className={value === 25 || value === 75 ? 'minor-tick' : ''} x="35" y={y + 4} textAnchor="end">{value}%</text></g>
      })}
      {history.map((point, index) => (
        <rect key={point.timestamp} x={coordinates[index].x - slotWidth * 0.35} y={coordinates[index].y} width={slotWidth * 0.7} height={190 - coordinates[index].y} rx="3" fill="#18796a">
          <title>{formatSampleTime(point.timestamp)}: {point.occupancy} %</title>
        </rect>
      ))}
      {[0, 4, 8, 12, 16, 20, 23].map(index => <text className={[4, 12, 20].includes(index) ? 'minor-tick' : ''} key={index} x={coordinates[index].x} y="221" textAnchor={index === 23 ? 'end' : index === 0 ? 'start' : 'middle'}>{formatHour(history[index].timestamp)}</text>)}
    </svg>
  )
}
