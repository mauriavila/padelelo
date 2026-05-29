// lib/types.ts
export interface Profile {
  id: string
  username: string
  elo: number
  division: number
  wins: number
  losses: number
  created_at: string
}

export interface Match {
  id: string
  creator_id: string
  location: string
  scheduled_at: string
  spots_total: number
  spots_taken: number
  division: number | null
  is_public: boolean
  invite_code: string | null
  status: 'open' | 'full' | 'finished' | 'cancelled'
  created_at: string
  creator?: Profile
}

export interface MatchPlayer {
  match_id: string
  player_id: string
  team: number | null
  joined_at: string
  player?: Profile
}
