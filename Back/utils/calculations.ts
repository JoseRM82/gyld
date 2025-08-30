export function minValue(values: number[]): number {
  return Math.min(...values);
}

export function maxValue(values: number[]): number {
  return Math.max(...values);
}

export function getPerformanceRange(values: number[]): string {
  return `${minValue(values).toFixed(0)}-${maxValue(values).toFixed(0)}`;
}

export function getAvgScore(values: number[]): number {
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

export function assignSortedPlayersToTeams(players: Record<any, any>[], numTeams: number, teams: Record<any, any>[]): void {
  for (let i = 0; i < players.length; i++) {
    const player = players[i];
    
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
    
    teams.push({
      player_id: player.player_id,
      new_team: targetTeam + 1
    });
  }
}
