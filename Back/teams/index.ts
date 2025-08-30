import { TeamAssignment, TeamSummary } from './interfaces';
import { Player, PlayerMessage, PlayerSpend } from '../users/interfaces';
import { calculateAveragePointsPerEvent, calculateMessagesLengthTotal, calculatePointsSpentTotal } from '../users/index';
import { assignSortedPlayersToTeams, getAvgScore, getPerformanceRange } from '../utils/calculations';

// Helper function to calculate team statistics for any sort type
function calculateTeamStats(
  teamPlayerData: Player[],
  playerIds: number[],
  sortType: 'events_performance' | 'messages_length' | 'points_spent',
  messages?: PlayerMessage[],
  spends?: PlayerSpend[]
): { avgScore: number; totalPoints: number; performanceRange: string } {
  let avgScore = 0;
  let totalPoints = 0;
  let performanceRange = "0-0";

  if (teamPlayerData.length === 0) {
    return { avgScore, totalPoints, performanceRange };
  }

  // Calculate total points (same for all sort types)
  totalPoints = teamPlayerData.reduce((sum, player) => sum + player.historical_points_earned, 0);

  switch (sortType) {
    case 'events_performance':
      const teamAvgScores = teamPlayerData.map(player => calculateAveragePointsPerEvent(player));
      avgScore = getAvgScore(teamAvgScores);
      performanceRange = `${getPerformanceRange(teamAvgScores)} points/event`;
      break;

    case 'messages_length':
      if (messages) {
        const messageLengths = calculateMessagesLengthTotal(messages);
        const teamMessageLengths = playerIds.map(id => messageLengths.get(id) || 0);
        avgScore = getAvgScore(teamMessageLengths);
        performanceRange = `${getPerformanceRange(teamMessageLengths)} characters`;
      }
      break;

    case 'points_spent':
      if (spends) {
        const pointsSpent = calculatePointsSpentTotal(spends);
        const teamPointsSpent = playerIds.map(id => pointsSpent.get(id) || 0);
        avgScore = getAvgScore(teamPointsSpent);
        performanceRange = `${getPerformanceRange(teamPointsSpent)} points`;
      }
      break;
  }

  return { avgScore, totalPoints, performanceRange };
}

export function assignPlayersToTeams(
  players: Player[], 
  numTeams: number, 
  sortType: 'events_performance' | 'messages_length' | 'points_spent', 
  messages?: PlayerMessage[], 
  spends?: PlayerSpend[]
): TeamAssignment[] {
  const assignments: TeamAssignment[] = [];
  
  // Validate that we don't have more teams than players
  if (numTeams > players.length) {
    throw new Error(`Cannot create ${numTeams} teams with only ${players.length} players. Maximum teams allowed: ${players.length}`);
  }
  
  // Validate minimum team size
  // const minTeamSize = 2;
  // if (Math.floor(players.length / numTeams) < minTeamSize) {
  //   throw new Error(`Cannot create ${numTeams} teams with minimum ${minTeamSize} players per team. Maximum teams allowed: ${Math.floor(players.length / minTeamSize)}`);
  // }
  
  // Sort players by performance
  const sortedPlayers = players.sort((a, b) => {
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
  
  // Assign players using real snake draft
  assignSortedPlayersToTeams(sortedPlayers, numTeams, assignments);
  
  return assignments;
}

export function generateTeamSummary(
  players: Player[], 
  assignments: TeamAssignment[], 
  numTeams: number, 
  sortType: 'events_performance' | 'messages_length' | 'points_spent', 
  messages?: PlayerMessage[], 
  spends?: PlayerSpend[]
): TeamSummary[] {
  const summaries: TeamSummary[] = [];
  
  // Validate that we don't have more teams than players
  if (numTeams > players.length) {
    throw new Error(`Cannot create ${numTeams} teams with only ${players.length} players. Maximum teams allowed: ${players.length}`);
  }
  
  for (let teamId = 1; teamId <= numTeams; teamId++) {
    const teamAssignments = assignments.filter(assignment => assignment.new_team === teamId);
    const playerIds = teamAssignments.map(assignment => assignment.player_id);
    
    // Get player data for this team
    const teamPlayerData = players.filter(player => playerIds.includes(player.player_id));
    
    const { avgScore, totalPoints, performanceRange } = calculateTeamStats(
      teamPlayerData,
      playerIds,
      sortType,
      messages,
      spends
    );
    
    summaries.push({
      team_id: teamId,
      size: teamPlayerData.length,
      avg_points_per_event: avgScore,
      total_points: totalPoints,
      players: playerIds,
      performance_range: performanceRange
    });
  }
  
  return summaries;
}
