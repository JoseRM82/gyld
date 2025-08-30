import { assignPlayersToTeams, generateTeamSummary } from './teams/index';
import { loadDataBySortType } from './utils/csvReader';
import { parseCommandLineArgs } from './utils/commands';
import { printResults } from './utils/console';

async function main(): Promise<void> {
  try {
    const { teams, sortType } = parseCommandLineArgs();
    
    if (teams < 1) {
      console.error('Error: Number of teams must be at least 1');
      process.exit(1);
    }
    
    console.log(`Starting player assignment to ${teams} teams using ${sortType} sort...`);
    
    // Load data based on sort type
    const { players, messages, spends } = await loadDataBySortType(sortType);
    
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

if (require.main === module) {
  main().catch(console.error);
}
