export interface Player {
  player_id: number;
  historical_events_participated: number;
  historical_points_earned: number;
}

export interface PlayerMessage {
  player_id: number;
  text_length: number;
}

export interface PlayerSpend {
  player_id: number;
  points_spent: number;
}
