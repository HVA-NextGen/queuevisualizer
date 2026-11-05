export function getOccupancy(total: number, capacity: number): number {
  if (!Number.isInteger(total) || total < 0 || !Number.isInteger(capacity) || capacity <= 0) {
    throw new Error('Invalid demo patient count or capacity')
  }
  return total / capacity * 100
}

export function getCongestion(occupancy: number) {
  if (!Number.isFinite(occupancy) || occupancy < 0) {
    throw new Error('Invalid demo occupancy')
  }
  if (occupancy < 40) return { key: 'low', label: 'Ei ruuhkaa', color: '#18796a' } as const
  if (occupancy < 75) return { key: 'moderate', label: 'Kohtalaista ruuhkaa', color: '#a56409' } as const
  return { key: 'high', label: 'Ruuhkautunut', color: '#b63f4b' } as const
}
