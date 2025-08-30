import { printResults } from '../../utils/console';
import { Player, PlayerMessage, PlayerSpend } from '../../users/interfaces';
import { TeamAssignment, TeamSummary } from '../../teams/interfaces';

// Mock console.log to capture output
const originalConsoleLog = console.log;
const mockConsoleLog = jest.fn();

describe('Console Utils', () => {
  beforeEach(() => {
    // Mock console.log before each test
    console.log = mockConsoleLog;
    mockConsoleLog.mockClear();
  });

  afterEach(() => {
    // Restore original console.log after each test
    console.log = originalConsoleLog;
  });

  describe('printResults', () => {
    const mockPlayers: Player[] = [
      { player_id: 1, historical_events_participated: 2, historical_points_earned: 200 },
      { player_id: 2, historical_events_participated: 1, historical_points_earned: 100 },
      { player_id: 3, historical_events_participated: 3, historical_points_earned: 300 }
    ];

    const mockAssignments: TeamAssignment[] = [
      { player_id: 1, new_team: 1 },
      { player_id: 2, new_team: 2 },
      { player_id: 3, new_team: 1 }
    ];

    const mockSummaries: TeamSummary[] = [
      {
        team_id: 1,
        size: 2,
        avg_points_per_event: 125,
        total_points: 500,
        players: [1, 3],
        performance_range: "100-150 points/event"
      },
      {
        team_id: 2,
        size: 1,
        avg_points_per_event: 100,
        total_points: 100,
        players: [2],
        performance_range: "100-100 points/event"
      }
    ];

    const mockMessages: PlayerMessage[] = [
      { player_id: 1, text_length: 100 },
      { player_id: 2, text_length: 200 },
      { player_id: 3, text_length: 150 }
    ];

    const mockSpends: PlayerSpend[] = [
      { player_id: 1, points_spent: 50 },
      { player_id: 2, points_spent: 100 },
      { player_id: 3, points_spent: 75 }
    ];

    it('should print results for events_performance sort type', () => {
      printResults(mockAssignments, mockSummaries, mockPlayers, 'events_performance');

      // Check that console.log was called
      expect(mockConsoleLog).toHaveBeenCalled();

      // Check for specific output patterns
      const output = mockConsoleLog.mock.calls.flat().join('\n');
      
      expect(output).toContain('=== PLAYER ASSIGNMENTS ===');
      expect(output).toContain('=== TEAM SUMMARY ===');
      expect(output).toContain('=== BALANCE VERIFICATION ===');
      expect(output).toContain('average points/event');
      expect(output).toContain('Team 1:');
      expect(output).toContain('Team 2:');
    });

    it('should print results for messages_length sort type', () => {
      printResults(mockAssignments, mockSummaries, mockPlayers, 'messages_length', mockMessages);

      const output = mockConsoleLog.mock.calls.flat().join('\n');
      
      expect(output).toContain('total message length');
      expect(output).toContain('characters');
    });

    it('should print results for points_spent sort type', () => {
      printResults(mockAssignments, mockSummaries, mockPlayers, 'points_spent', undefined, mockSpends);

      const output = mockConsoleLog.mock.calls.flat().join('\n');
      
      expect(output).toContain('total points spent');
      expect(output).toContain('points');
    });

    it('should handle empty assignments', () => {
      const emptyAssignments: TeamAssignment[] = [];
      const emptySummaries: TeamSummary[] = [];

      printResults(emptyAssignments, emptySummaries, mockPlayers, 'events_performance');

      expect(mockConsoleLog).toHaveBeenCalled();
      
      const output = mockConsoleLog.mock.calls.flat().join('\n');
      expect(output).toContain('=== PLAYER ASSIGNMENTS ===');
      expect(output).toContain('=== TEAM SUMMARY ===');
    });

    it('should handle empty players array', () => {
      const emptyPlayers: Player[] = [];

      printResults(mockAssignments, mockSummaries, emptyPlayers, 'events_performance');

      expect(mockConsoleLog).toHaveBeenCalled();
      
      const output = mockConsoleLog.mock.calls.flat().join('\n');
      expect(output).toContain('=== PLAYER ASSIGNMENTS ===');
    });

    it('should display performance range correctly', () => {
      printResults(mockAssignments, mockSummaries, mockPlayers, 'events_performance');

      const output = mockConsoleLog.mock.calls.flat().join('\n');
      
      expect(output).toContain('Performance Range:');
      expect(output).toContain('100-150 points/event');
      expect(output).toContain('100-100 points/event');
    });

    it('should display team sizes correctly', () => {
      printResults(mockAssignments, mockSummaries, mockPlayers, 'events_performance');

      const output = mockConsoleLog.mock.calls.flat().join('\n');
      
      expect(output).toContain('Size: 2 players');
      expect(output).toContain('Size: 1 players');
    });

    it('should display total points correctly', () => {
      printResults(mockAssignments, mockSummaries, mockPlayers, 'events_performance');

      const output = mockConsoleLog.mock.calls.flat().join('\n');
      
      expect(output).toContain('Total points: 500');
      expect(output).toContain('Total points: 100');
    });

    it('should display player assignments correctly', () => {
      printResults(mockAssignments, mockSummaries, mockPlayers, 'events_performance');

      const output = mockConsoleLog.mock.calls.flat().join('\n');
      
      expect(output).toContain('1 -> Team 1');
      expect(output).toContain('2 -> Team 2');
      expect(output).toContain('3 -> Team 1');
    });

    it('should handle undefined messages and spends', () => {
      printResults(mockAssignments, mockSummaries, mockPlayers, 'events_performance', undefined, undefined);

      expect(mockConsoleLog).toHaveBeenCalled();
      
      const output = mockConsoleLog.mock.calls.flat().join('\n');
      expect(output).toContain('=== PLAYER ASSIGNMENTS ===');
      expect(output).toContain('=== TEAM SUMMARY ===');
    });

    it('should display balance verification', () => {
      printResults(mockAssignments, mockSummaries, mockPlayers, 'events_performance');

      const output = mockConsoleLog.mock.calls.flat().join('\n');
      
      expect(output).toContain('=== BALANCE VERIFICATION ===');
      expect(output).toContain('Maximum size difference between teams:');
    });
  });
});

