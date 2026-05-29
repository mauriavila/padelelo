// lib/elo.ts
const K_NEW = 32        // < 30 partidas
const K_ESTABLISHED = 16

export function calculateExpectedScore(playerElo: number, opponentElo: number): number {
  return 1 / (1 + Math.pow(10, (opponentElo - playerElo) / 400))
}

export function calculateNewElo(
  playerElo: number,
  opponentElo: number,
  actualScore: number,  // 1 = victoria, 0 = derrota
  gamesPlayed: number
): number {
  const k = gamesPlayed < 30 ? K_NEW : K_ESTABLISHED
  const expected = calculateExpectedScore(playerElo, opponentElo)
  return Math.round(playerElo + k * (actualScore - expected))
}
