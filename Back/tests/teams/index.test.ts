import { assignPlayersToTeams, generateTeamSummary } from '../../teams/index';
import { Player, PlayerMessage, PlayerSpend } from '../../users/interfaces';
import { TeamAssignment, TeamSummary } from '../../teams/interfaces';

describe('Team Functions', () => {
  const mockPlayers: Player[] = [
    { player_id: 1, historical_events_participated: 2, historical_points_earned: 200 },
    { player_id: 2, historical_events_participated: 1, historical_points_earned: 100 },
    { player_id: 3, historical_events_participated: 3, historical_points_earned: 300 },
    { player_id: 4, historical_events_participated: 1, historical_points_earned: 50 },
    { player_id: 5, historical_events_participated: 2, historical_points_earned: 150 },
    { player_id: 6, historical_events_participated: 1, historical_points_earned: 75 }
  ];

  const mockMessages: PlayerMessage[] = [
    { player_id: 1, text_length: 100 },
    { player_id: 2, text_length: 200 },
    { player_id: 3, text_length: 150 },
    { player_id: 4, text_length: 50 },
    { player_id: 5, text_length: 300 },
    { player_id: 6, text_length: 75 }
  ];

  const mockSpends: PlayerSpend[] = [
    { player_id: 1, points_spent: 50 },
    { player_id: 2, points_spent: 100 },
    { player_id: 3, points_spent: 75 },
    { player_id: 4, points_spent: 25 },
    { player_id: 5, points_spent: 150 },
    { player_id: 6, points_spent: 60 }
  ];

  describe('assignPlayersToTeams', () => {
    it('should assign players to teams using snake draft for events_performance', () => {
      const result = assignPlayersToTeams(mockPlayers, 2, 'events_performance');
      
      expect(result).toHaveLength(6);
      
      // Check that all players are assigned
      const assignedPlayerIds = result.map(a => a.player_id).sort();
      expect(assignedPlayerIds).toEqual([1, 2, 3, 4, 5, 6]);
      
      // Check that teams are balanced (3 players each)
      const team1Players = result.filter(a => a.new_team === 1);
      const team2Players = result.filter(a => a.new_team === 2);
      expect(team1Players).toHaveLength(3);
      expect(team2Players).toHaveLength(3);
    });

    it('should assign players to teams using snake draft for messages_length', () => {
      const result = assignPlayersToTeams(mockPlayers, 2, 'messages_length', mockMessages);
      
      expect(result).toHaveLength(6);
      
      // Check that all players are assigned
      const assignedPlayerIds = result.map(a => a.player_id).sort();
      expect(assignedPlayerIds).toEqual([1, 2, 3, 4, 5, 6]);
      
      // Check that teams are balanced
      const team1Players = result.filter(a => a.new_team === 1);
      const team2Players = result.filter(a => a.new_team === 2);
      expect(team1Players).toHaveLength(3);
      expect(team2Players).toHaveLength(3);
    });

    it('should assign players to teams using snake draft for points_spent', () => {
      const result = assignPlayersToTeams(mockPlayers, 2, 'points_spent', undefined, mockSpends);
      
      expect(result).toHaveLength(6);
      
      // Check that all players are assigned
      const assignedPlayerIds = result.map(a => a.player_id).sort();
      expect(assignedPlayerIds).toEqual([1, 2, 3, 4, 5, 6]);
      
      // Check that teams are balanced
      const team1Players = result.filter(a => a.new_team === 1);
      const team2Players = result.filter(a => a.new_team === 2);
      expect(team1Players).toHaveLength(3);
      expect(team2Players).toHaveLength(3);
    });

    it('should handle 3 teams assignment', () => {
      const result = assignPlayersToTeams(mockPlayers, 3, 'events_performance');
      
      expect(result).toHaveLength(6);
      
      // Check that all players are assigned
      const assignedPlayerIds = result.map(a => a.player_id).sort();
      expect(assignedPlayerIds).toEqual([1, 2, 3, 4, 5, 6]);
      
      // Check that teams are balanced (2 players each)
      const team1Players = result.filter(a => a.new_team === 1);
      const team2Players = result.filter(a => a.new_team === 2);
      const team3Players = result.filter(a => a.new_team === 3);
      expect(team1Players).toHaveLength(2);
      expect(team2Players).toHaveLength(2);
      expect(team3Players).toHaveLength(2);
    });

    it('should throw error when more teams than players', () => {
      expect(() => {
        assignPlayersToTeams(mockPlayers, 10, 'events_performance');
      }).toThrow('Cannot create 10 teams with only 6 players');
    });

    it('should handle equal teams and players', () => {
      const result = assignPlayersToTeams(mockPlayers, 6, 'events_performance');
      
      expect(result).toHaveLength(6);
      
      // Each team should have exactly 1 player
      for (let i = 1; i <= 6; i++) {
        const teamPlayers = result.filter(a => a.new_team === i);
        expect(teamPlayers).toHaveLength(1);
      }
    });
  });

  describe('generateTeamSummary', () => {
    let assignments: TeamAssignment[];

    beforeEach(() => {
      assignments = assignPlayersToTeams(mockPlayers, 2, 'events_performance');
    });

    it('should generate team summary for events_performance', () => {
      const result = generateTeamSummary(mockPlayers, assignments, 2, 'events_performance');
      
      expect(result).toHaveLength(2);
      
      // Check team 1
      expect(result[0].team_id).toBe(1);
      expect(result[0].size).toBe(3);
      expect(result[0].players).toHaveLength(3);
      expect(result[0].performance_range).toMatch(/^\d+-\d+ points\/event$/);
      
      // Check team 2
      expect(result[1].team_id).toBe(2);
      expect(result[1].size).toBe(3);
      expect(result[1].players).toHaveLength(3);
      expect(result[1].performance_range).toMatch(/^\d+-\d+ points\/event$/);
    });

    it('should generate team summary for messages_length', () => {
      const result = generateTeamSummary(mockPlayers, assignments, 2, 'messages_length', mockMessages);
      
      expect(result).toHaveLength(2);
      
      // Check performance range format
      expect(result[0].performance_range).toMatch(/^\d+-\d+ characters$/);
      expect(result[1].performance_range).toMatch(/^\d+-\d+ characters$/);
    });

    it('should generate team summary for points_spent', () => {
      const result = generateTeamSummary(mockPlayers, assignments, 2, 'points_spent', undefined, mockSpends);
      
      expect(result).toHaveLength(2);
      
      // Check performance range format
      expect(result[0].performance_range).toMatch(/^\d+-\d+ points$/);
      expect(result[1].performance_range).toMatch(/^\d+-\d+ points$/);
    });

    it('should calculate total points correctly', () => {
      const result = generateTeamSummary(mockPlayers, assignments, 2, 'events_performance');
      
      // Total points should be sum of all players' historical_points_earned
      const totalPoints = mockPlayers.reduce((sum, player) => sum + player.historical_points_earned, 0);
      const resultTotalPoints = result.reduce((sum, team) => sum + team.total_points, 0);
      
      expect(resultTotalPoints).toBe(totalPoints);
    });

    it('should handle empty team', () => {
      const emptyAssignments: TeamAssignment[] = [];
      const result = generateTeamSummary(mockPlayers, emptyAssignments, 1, 'events_performance');
      
      expect(result).toHaveLength(1);
      expect(result[0].team_id).toBe(1);
      expect(result[0].size).toBe(0);
      expect(result[0].players).toHaveLength(0);
      expect(result[0].avg_points_per_event).toBe(0);
      expect(result[0].total_points).toBe(0);
      expect(result[0].performance_range).toBe("0-0");
    });

    it('should throw error when more teams than players', () => {
      expect(() => {
        generateTeamSummary(mockPlayers, assignments, 10, 'events_performance');
      }).toThrow('Cannot create 10 teams with only 6 players');
    });
  });
});

