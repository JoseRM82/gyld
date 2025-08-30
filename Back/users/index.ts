import { Player, PlayerMessage, PlayerSpend } from './interfaces';

export function calculateAveragePointsPerEvent(player: Player): number {
  if (player.historical_events_participated === 0) {
    return 0;
  }
  return player.historical_points_earned / player.historical_events_participated;
}

export function calculateMessagesLengthTotal(messages: PlayerMessage[]): Map<number, number> {
  const playerMessageLengths = new Map<number, number>();
  
  messages.forEach(message => {
    const currentLength = playerMessageLengths.get(message.player_id) || 0;
    playerMessageLengths.set(message.player_id, currentLength + message.text_length);
  });
  
  return playerMessageLengths;
}

export function calculatePointsSpentTotal(spends: PlayerSpend[]): Map<number, number> {
  const playerPointsSpent = new Map<number, number>();
  
  spends.forEach(spend => {
    const currentSpent = playerPointsSpent.get(spend.player_id) || 0;
    playerPointsSpent.set(spend.player_id, currentSpent + spend.points_spent);
  });
  
  return playerPointsSpent;
}

export function sortPlayersByPerformance(
  players: Player[], 
  sortType: 'events_performance' | 'messages_length' | 'points_spent', 
  messages?: PlayerMessage[], 
  spends?: PlayerSpend[]
): Player[] {
  return players.sort((a, b) => {
    let scoreA: number;
    let scoreB: number;
    
    switch (sortType) {
      case 'events_performance':
        scoreA = calculateAveragePointsPerEvent(a);
        scoreB = calculateAveragePointsPerEvent(b);
        break;
        
      case 'messages_length':
        if (!messages) {
          scoreA = scoreB = 0;
          break;
        }
        const messageLengths = calculateMessagesLengthTotal(messages);
        scoreA = messageLengths.get(a.player_id) || 0;
        scoreB = messageLengths.get(b.player_id) || 0;
        break;
        
      case 'points_spent':
        if (!spends) {
          scoreA = scoreB = 0;
          break;
        }
        const pointsSpent = calculatePointsSpentTotal(spends);
        scoreA = pointsSpent.get(a.player_id) || 0;
        scoreB = pointsSpent.get(b.player_id) || 0;
        break;
        
      default:
        scoreA = scoreB = 0;
    }
    
    // Sort by score (descending)
    if (scoreA !== scoreB) {
      return scoreB - scoreA;
    }
    
    // In case of tie, by player_id (ascending)
    return a.player_id - b.player_id;
  });
}
