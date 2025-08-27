import * as fs from 'fs';
import * as path from 'path';
import csv from 'csv-parser';

interface Player {
  player_id: number;
  historical_events_participated: number;
  historical_points_earned: number;
}



interface PlayerMessage {
  player_id: number;
  text_length: number;
}

interface PlayerSpend {
  player_id: number;
  points_spent: number;
}



type SortType = 'events_performance' | 'messages_length' | 'points_spent';

interface TeamAssignment {
  player_id: number;
  new_team: number;
}

interface TeamSummary {
  team_id: number;
  size: number;
  avg_points_per_event: number;
  total_points: number;
  players: number[];
}

function calculateAveragePointsPerEvent(player: Player): number {
  if (player.historical_events_participated === 0) {
    return 0;
  }
  return player.historical_points_earned / player.historical_events_participated;
}

function calculateMessagesLengthTotal(messages: PlayerMessage[]): Map<number, number> {
  const playerMessageLengths = new Map<number, number>();
  
  messages.forEach(message => {
    const currentLength = playerMessageLengths.get(message.player_id) || 0;
    playerMessageLengths.set(message.player_id, currentLength + message.text_length);
  });
  
  return playerMessageLengths;
}

function calculatePointsSpentTotal(spends: PlayerSpend[]): Map<number, number> {
  const playerPointsSpent = new Map<number, number>();
  
  spends.forEach(spend => {
    const currentSpent = playerPointsSpent.get(spend.player_id) || 0;
    playerPointsSpent.set(spend.player_id, currentSpent + spend.points_spent);
  });
  
  return playerPointsSpent;
}

function sortPlayersByPerformance(players: Player[], sortType: SortType, messages?: PlayerMessage[], spends?: PlayerSpend[]): Player[] {
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

function assignPlayersToTeams(players: Player[], numTeams: number, sortType: SortType, messages?: PlayerMessage[], spends?: PlayerSpend[]): TeamAssignment[] {
  const assignments: TeamAssignment[] = [];
  
  // Sort players by performance
  const sortedPlayers = sortPlayersByPerformance(players, sortType, messages, spends);
  
  // Assign players using real snake draft
  for (let i = 0; i < sortedPlayers.length; i++) {
    const player = sortedPlayers[i];
    
    // Determine which team to assign using snake draft
    let targetTeam: number;
    
    if (i < numTeams) {
      // For the best players, assign one to each team
      targetTeam = i;
    } else {
      // Snake draft: alternate direction each round
      const round = Math.floor(i / numTeams);
      const positionInRound = i % numTeams;
      
      if (round % 2 === 0) {
        // Even rounds: assign from left to right (0, 1, 2, ...)
        targetTeam = positionInRound;
      } else {
        // Odd rounds: assign from right to left (..., 2, 1, 0)
        targetTeam = numTeams - 1 - positionInRound;
      }
    }
    
    assignments.push({
      player_id: player.player_id,
      new_team: targetTeam + 1
    });
  }
  
  return assignments;
}

function generateTeamSummary(players: Player[], assignments: TeamAssignment[], numTeams: number, sortType: SortType, messages?: PlayerMessage[], spends?: PlayerSpend[]): TeamSummary[] {
  const summaries: TeamSummary[] = [];
  
  for (let teamId = 1; teamId <= numTeams; teamId++) {
    const teamAssignments = assignments.filter(assignment => assignment.new_team === teamId);
    const playerIds = teamAssignments.map(assignment => assignment.player_id);
    
    // Get player data for this team
    const teamPlayerData = players.filter(player => playerIds.includes(player.player_id));
    
    let avgScore = 0;
    let totalPoints = 0;
    
    if (teamPlayerData.length > 0) {
      switch (sortType) {
        case 'events_performance':
          const teamAvgScores = teamPlayerData.map(player => calculateAveragePointsPerEvent(player));
          avgScore = teamAvgScores.reduce((sum, score) => sum + score, 0) / teamAvgScores.length;
          totalPoints = teamPlayerData.reduce((sum, player) => sum + player.historical_points_earned, 0);
          break;
          
        case 'messages_length':
          if (messages) {
            const messageLengths = calculateMessagesLengthTotal(messages);
            const teamMessageLengths = playerIds.map(id => messageLengths.get(id) || 0);
            avgScore = teamMessageLengths.reduce((sum, length) => sum + length, 0) / teamMessageLengths.length;
            totalPoints = teamPlayerData.reduce((sum, player) => sum + player.historical_points_earned, 0);
          }
          break;
          
        case 'points_spent':
          if (spends) {
            const pointsSpent = calculatePointsSpentTotal(spends);
            const teamPointsSpent = playerIds.map(id => pointsSpent.get(id) || 0);
            avgScore = teamPointsSpent.reduce((sum, spent) => sum + spent, 0) / teamPointsSpent.length;
            totalPoints = teamPlayerData.reduce((sum, player) => sum + player.historical_points_earned, 0);
          }
          break;
      }
    }
    
    summaries.push({
      team_id: teamId,
      size: teamPlayerData.length,
      avg_points_per_event: avgScore,
      total_points: totalPoints,
      players: playerIds
    });
  }
  
  return summaries;
}

function printResults(assignments: TeamAssignment[], summaries: TeamSummary[], players: Player[], sortType: SortType, messages?: PlayerMessage[], spends?: PlayerSpend[]): void {
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
      const player = playerMap.get(assignment.player_id)!;
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
    console.log(`${assignment.player_id} -> Team ${assignment.new_team} (${assignment.score.toFixed(2)}) [${player.historical_events_participated}, ${player.historical_points_earned}]`);
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

function parseCommandLineArgs(): { teams: number; sortType: SortType } {
  const args = process.argv.slice(2);
  let teams = 3; // default value
  let sortType: SortType = 'events_performance'; // default value
  
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--teams' && i + 1 < args.length) {
      teams = parseInt(args[i + 1]);
    } else if (args[i] === '--events_performance') {
      sortType = 'events_performance';
    } else if (args[i] === '--messages_length') {
      sortType = 'messages_length';
    } else if (args[i] === '--points_spent') {
      sortType = 'points_spent';
    }
  }
  
  // If no sort type specified, choose randomly
  if (!args.includes('--events_performance') && !args.includes('--messages_length') && !args.includes('--points_spent')) {
    const sortTypes: SortType[] = ['events_performance', 'messages_length', 'points_spent'];
    sortType = sortTypes[Math.floor(Math.random() * sortTypes.length)];
  }
  
  return { teams, sortType };
}

async function main(): Promise<void> {
  try {
    const { teams, sortType } = parseCommandLineArgs();
    
    if (teams < 1) {
      console.error('Error: Number of teams must be at least 1');
      process.exit(1);
    }
    
    console.log(`Starting player assignment to ${teams} teams using ${sortType} sort...`);
    
    // Read Level A players CSV file
    const playersCsvPath = path.join(process.cwd(), '..', 'data', 'level_a_players.csv');
    let players: Player[] = [];
    
    // Read Level B data if needed
    let messages: PlayerMessage[] = [];
    let spends: PlayerSpend[] = [];
    
    if (sortType === 'messages_length') {
      const messagesCsvPath = path.join(process.cwd(), '..', 'data', 'level_b_messages.csv');
      messages = await readCsvFile<PlayerMessage>(messagesCsvPath, (row: any) => ({
        player_id: parseInt(row.player_id),
        text_length: parseInt(row.text_length)
      }));
    }
    
    if (sortType === 'points_spent') {
      const spendsCsvPath = path.join(process.cwd(), '..', 'data', 'level_b_spend.csv');
      spends = await readCsvFile<PlayerSpend>(spendsCsvPath, (row: any) => ({
        player_id: parseInt(row.player_id),
        points_spent: parseInt(row.points_spent)
      }));
    }
    
    // Read players CSV with only the columns we need
    players = await readCsvFile<Player>(playersCsvPath, (row: any) => ({
      player_id: parseInt(row.player_id),
      historical_points_earned: parseInt(row.historical_points_earned),
      historical_events_participated: parseInt(row.historical_events_participated)
    }));
    
    // Assign players to teams
    const assignments = assignPlayersToTeams(players, teams, sortType, messages, spends);
    
    // Generate team summary
    const summaries = generateTeamSummary(players, assignments, teams, sortType, messages, spends);
    
    // Print results
    printResults(assignments, summaries, players, sortType, messages, spends);
    
  } catch (error) {
    console.error('Execution error:', error);
    process.exit(1);
  }
}

function readCsvFile<T>(filePath: string, mapper: (row: any) => T): Promise<T[]> {
  return new Promise((resolve, reject) => {
    const data: T[] = [];
    
    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (row: any) => {
        data.push(mapper(row));
      })
      .on('end', () => {
        resolve(data);
      })
      .on('error', (error: any) => {
        console.error(`Error reading CSV file ${filePath}:`, error);
        reject(error);
      });
  });
}

if (require.main === module) {
  main().catch(console.error);
}

