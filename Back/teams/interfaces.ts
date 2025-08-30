export interface TeamAssignment {
  player_id: number;
  new_team: number;
}

export interface TeamSummary {
  team_id: number;
  size: number;
  avg_points_per_event: number;
  total_points: number;
  players: number[];
  performance_range: string;
}
