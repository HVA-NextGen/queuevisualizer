import { getOccupancy, getCongestion } from '../lib/congestion'

export interface HistoryPoint {
  timestamp: string
  occupancy: number
}

export interface DemoData {
  total: number
  urgent: number
  capacity: number
  timestamp: string
  history: HistoryPoint[]
}

export function formatSampleTime(timestamp: string): string {
  if (!Number.isFinite(Date.parse(timestamp))) throw new Error('Invalid demo timestamp')
  return new Intl.DateTimeFormat('fi-FI', {
    timeZone: 'Europe/Helsinki', day: 'numeric', month: 'numeric',
    year: 'numeric', hour: '2-digit', minute: '2-digit',
  }).format(new Date(timestamp))
}

export function formatHour(timestamp: string): string {
  if (!Number.isFinite(Date.parse(timestamp))) throw new Error('Invalid demo timestamp')
  return new Intl.DateTimeFormat('fi-FI', {
    timeZone: 'Europe/Helsinki', hour: '2-digit', minute: '2-digit',
  }).format(new Date(timestamp))
}

export function validateDemo(data: DemoData): void {
  const occupancy = getOccupancy(data.total, data.capacity)
  if (!Number.isInteger(data.urgent) || data.urgent < 0 || data.urgent > data.total) {
    throw new Error('Invalid demo urgent patient count')
  }
  if (!Number.isFinite(Date.parse(data.timestamp)) || data.history.length !== 24) {
    throw new Error('Invalid demo timestamp or history length')
  }
  data.history.forEach((point, index) => {
    getCongestion(point.occupancy)
    const expected = Date.parse(data.timestamp) - (23 - index) * 3_600_000
    if (Date.parse(point.timestamp) !== expected) throw new Error('Invalid hourly demo history')
  })
  if (data.history.at(-1)?.occupancy !== occupancy) {
    throw new Error('Demo history does not match current occupancy')
  }
}

const timestamp = '2026-11-05T18:00:00.000Z'
const hourlyOccupancy = [48, 44, 39, 34, 29, 25, 22, 20, 23, 30, 38, 46, 51, 55, 60, 64, 59, 56, 61, 67, 73, 78, 74, 70]

export const demo: DemoData = {
  total: 42,
  urgent: 8,
  capacity: 60,
  timestamp,
  history: hourlyOccupancy.map((occupancy, index) => ({
    timestamp: new Date(Date.parse(timestamp) - (23 - index) * 3_600_000).toISOString(),
    occupancy,
  })),
}

validateDemo(demo)
