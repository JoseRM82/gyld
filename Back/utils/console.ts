import { Player, PlayerMessage, PlayerSpend } from '../users/interfaces';
import { TeamAssignment, TeamSummary } from '../teams/interfaces';
import { calculateAveragePointsPerEvent, calculateMessagesLengthTotal, calculatePointsSpentTotal } from '../users/index';
import { SortType } from './commands';

export function printResults(
  assignments: TeamAssignment[], 
  summaries: TeamSummary[], 
  players: Player[], 
  sortType: SortType, 
  messages?: PlayerMessage[], 
  spends?: PlayerSpend[]
): void {
  console.log('\n=== PLAYER ASSIGNMENTS ===');
  
  let headerText: string;
  switch (sortType) {
    case 'events_performance':
      headerText = 'player_id -> new_team (average points/event) [events_participated, total_points]';
      break;
    case 'messages_length':
      headerText = 'player_id -> new_team (total message length) [events_participated, total_points]';
      break;
    case 'points_spent':
      headerText = 'player_id -> new_team (total points spent) [events_participated, total_points]';
      break;
  }
  
  console.log(headerText);
  console.log('------------------------------------------------------------------------------');
  
  // Create a player map for quick access
  const playerMap = new Map(players.map(player => [player.player_id, player]));
  
  // Sort assignments by score (descending)
  const sortedAssignments = assignments
    .map(assignment => {
      const player = playerMap.get(assignment.player_id);
      if (!player) {
        console.warn(`Player ${assignment.player_id} not found in player map`);
        return {
          ...assignment,
          player: null,
          score: 0
        };
      }
      let score: number;
      
      switch (sortType) {
        case 'events_performance':
          score = calculateAveragePointsPerEvent(player);
          break;
        case 'messages_length':
          if (messages) {
            const messageLengths = calculateMessagesLengthTotal(messages);
            score = messageLengths.get(player.player_id) || 0;
          } else {
            score = 0;
          }
          break;
        case 'points_spent':
          if (spends) {
            const pointsSpent = calculatePointsSpentTotal(spends);
            score = pointsSpent.get(player.player_id) || 0;
          } else {
            score = 0;
          }
          break;
        default:
          score = 0;
      }
      
      return {
        ...assignment,
        player,
        score
      };
    })
    .sort((a, b) => b.score - a.score);
  
  sortedAssignments.forEach(assignment => {
    const player = assignment.player;
    if (player) {
      console.log(`${assignment.player_id} -> Team ${assignment.new_team} (${assignment.score.toFixed(2)}) [${player.historical_events_participated}, ${player.historical_points_earned}]`);
    } else {
      console.log(`${assignment.player_id} -> Team ${assignment.new_team} (${assignment.score.toFixed(2)}) [Player not found]`);
    }
  });
  
  console.log('\n=== TEAM SUMMARY ===');
  summaries.forEach(summary => {
    console.log(`\nTeam ${summary.team_id}:`);
    console.log(`  Size: ${summary.size} players`);
    
    let metricText: string;
    switch (sortType) {
      case 'events_performance':
        metricText = `Average points per event: ${summary.avg_points_per_event.toFixed(2)}`;
        break;
      case 'messages_length':
        metricText = `Average message length: ${summary.avg_points_per_event.toFixed(2)} characters`;
        break;
      case 'points_spent':
        metricText = `Average points spent: ${summary.avg_points_per_event.toFixed(2)} points`;
        break;
    }
    
    console.log(`  ${metricText}`);
    console.log(`  Performance Range: ${summary.performance_range} (min-max)`);
    console.log(`  Total points: ${summary.total_points}`);
    console.log(`  Players: ${summary.players.join(', ')}`);
    
    // Justification
    let justification: string;
    switch (sortType) {
      case 'events_performance':
        justification = 'Teams balanced by average points per event';
        break;
      case 'messages_length':
        justification = 'Teams balanced by total message length';
        break;
      case 'points_spent':
        justification = 'Teams balanced by total points spent';
        break;
    }
    
    console.log(`  Justification: ${justification}`);
  });
  
  // Verify size balance
  const sizes = summaries.map(s => s.size);
  const maxSize = Math.max(...sizes);
  const minSize = Math.min(...sizes);
  const sizeDifference = maxSize - minSize;
  
  console.log(`\n=== BALANCE VERIFICATION ===`);
  console.log(`Maximum size difference between teams: ${sizeDifference} players`);
}
