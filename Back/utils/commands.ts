export type SortType = 'events_performance' | 'messages_length' | 'points_spent';

export interface CommandLineArgs {
  teams: number;
  sortType: SortType;
}

export function parseCommandLineArgs(): CommandLineArgs {
  const args = process.argv.slice(2);
  let teams = 3; // default value
  let sortType: SortType = 'events_performance'; // default value
  
  const validSortFlags = ['--events_performance', '--messages_length', '--points_spent'];
  const invalidArgs: string[] = [];
  let sortTypeSpecified = false;
  
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--teams' && i + 1 < args.length) {
      const teamsValue = parseInt(args[i + 1]);
      if (!isNaN(teamsValue)) {
        teams = teamsValue;
      }
      // If NaN, keep the default value of 3
    } else if (args[i] === '--events_performance') {
      sortType = 'events_performance';
      sortTypeSpecified = true;
    } else if (args[i] === '--messages_length') {
      sortType = 'messages_length';
      sortTypeSpecified = true;
    } else if (args[i] === '--points_spent') {
      sortType = 'points_spent';
      sortTypeSpecified = true;
    } else if (args[i].startsWith('--')) {
      // Collect invalid arguments that start with --
      invalidArgs.push(args[i]);
    }
  }
  
  // Report invalid arguments
  if (invalidArgs.length > 0) {
    console.error(`Error: Unknown arguments: ${invalidArgs.join(', ')}`);
    console.error(`Valid sort options: ${validSortFlags.join(', ')}`);
    console.error(`Usage: npm start -- [--teams <number>] [--events_performance | --messages_length | --points_spent]`);
    process.exit(1);
  }
  
  // If no sort type specified, use events_performance as default
  if (!sortTypeSpecified) {
    console.log(`No sort type specified, using default: events_performance`);
  }
  
  return { teams, sortType };
}
