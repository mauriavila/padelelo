// lib/divisions.ts
export const DIVISIONS = [
  { id: 1, name: 'Principiante', minElo: 0,    maxElo: 800,      color: '#6b7280' },
  { id: 2, name: 'Básico',       minElo: 800,   maxElo: 1000,     color: '#3b82f6' },
  { id: 3, name: 'Intermedio',   minElo: 1000,  maxElo: 1200,     color: '#10b981' },
  { id: 4, name: 'Avanzado',     minElo: 1200,  maxElo: 1400,     color: '#f59e0b' },
  { id: 5, name: 'Competitivo',  minElo: 1400,  maxElo: 1600,     color: '#f97316' },
  { id: 6, name: 'Elite',        minElo: 1600,  maxElo: 1800,     color: '#e94560' },
  { id: 7, name: 'Pro',          minElo: 1800,  maxElo: Infinity, color: '#a855f7' },
] as const

export function getDivisionFromElo(elo: number): number {
  return DIVISIONS.find(d => elo >= d.minElo && elo < d.maxElo)?.id ?? 3
}

export function getDivisionName(divisionId: number): string {
  return DIVISIONS.find(d => d.id === divisionId)?.name ?? 'Intermedio'
}

export function getDivisionColor(divisionId: number): string {
  return DIVISIONS.find(d => d.id === divisionId)?.color ?? '#10b981'
}
