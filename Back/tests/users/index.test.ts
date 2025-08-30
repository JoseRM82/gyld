import { calculateAveragePointsPerEvent, calculateMessagesLengthTotal, calculatePointsSpentTotal, sortPlayersByPerformance } from '../../users/index';
import { Player, PlayerMessage, PlayerSpend } from '../../users/interfaces';

describe('User Functions', () => {
  describe('calculateAveragePointsPerEvent', () => {
    it('should calculate average points per event correctly', () => {
      const player: Player = {
        player_id: 1,
        historical_events_participated: 10,
        historical_points_earned: 1000
      };

      const result = calculateAveragePointsPerEvent(player);
      expect(result).toBe(100);
    });

    it('should return 0 when no events participated', () => {
      const player: Player = {
        player_id: 1,
        historical_events_participated: 0,
        historical_points_earned: 1000
      };

      const result = calculateAveragePointsPerEvent(player);
      expect(result).toBe(0);
    });

    it('should handle decimal results', () => {
      const player: Player = {
        player_id: 1,
        historical_events_participated: 3,
        historical_points_earned: 1000
      };

      const result = calculateAveragePointsPerEvent(player);
      expect(result).toBeCloseTo(333.33, 2);
    });
  });

  describe('calculateMessagesLengthTotal', () => {
    it('should calculate total message length per player correctly', () => {
      const messages: PlayerMessage[] = [
        { player_id: 1, text_length: 100 },
        { player_id: 1, text_length: 200 },
        { player_id: 2, text_length: 150 },
        { player_id: 1, text_length: 50 }
      ];

      const result = calculateMessagesLengthTotal(messages);
      
      expect(result.get(1)).toBe(350);
      expect(result.get(2)).toBe(150);
      expect(result.get(3)).toBeUndefined();
    });

    it('should handle empty messages array', () => {
      const messages: PlayerMessage[] = [];
      const result = calculateMessagesLengthTotal(messages);
      
      expect(result.size).toBe(0);
    });

    it('should handle single message', () => {
      const messages: PlayerMessage[] = [
        { player_id: 1, text_length: 100 }
      ];

      const result = calculateMessagesLengthTotal(messages);
      expect(result.get(1)).toBe(100);
    });
  });

  describe('calculatePointsSpentTotal', () => {
    it('should calculate total points spent per player correctly', () => {
      const spends: PlayerSpend[] = [
        { player_id: 1, points_spent: 100 },
        { player_id: 1, points_spent: 200 },
        { player_id: 2, points_spent: 150 },
        { player_id: 1, points_spent: 50 }
      ];

      const result = calculatePointsSpentTotal(spends);
      
      expect(result.get(1)).toBe(350);
      expect(result.get(2)).toBe(150);
      expect(result.get(3)).toBeUndefined();
    });

    it('should handle empty spends array', () => {
      const spends: PlayerSpend[] = [];
      const result = calculatePointsSpentTotal(spends);
      
      expect(result.size).toBe(0);
    });

    it('should handle zero points spent', () => {
      const spends: PlayerSpend[] = [
        { player_id: 1, points_spent: 0 },
        { player_id: 2, points_spent: 100 }
      ];

      const result = calculatePointsSpentTotal(spends);
      expect(result.get(1)).toBe(0);
      expect(result.get(2)).toBe(100);
    });
  });

  describe('sortPlayersByPerformance', () => {
    it('should sort players by events_performance correctly', () => {
      const players: Player[] = [
        { player_id: 1, historical_events_participated: 2, historical_points_earned: 100 },
        { player_id: 2, historical_events_participated: 1, historical_points_earned: 100 },
        { player_id: 3, historical_events_participated: 4, historical_points_earned: 200 }
      ];

      const result = sortPlayersByPerformance(players, 'events_performance');
      
      // Player 2 has highest average (100), Player 1 has 50, Player 3 has 50
      // In case of tie, player_id ascending order
      expect(result[0].player_id).toBe(2); // 100 points/event
      expect(result[1].player_id).toBe(1); // 50 points/event, lower ID
      expect(result[2].player_id).toBe(3); // 50 points/event, higher ID
    });

    it('should sort players by messages_length correctly', () => {
      const players: Player[] = [
        { player_id: 1, historical_events_participated: 1, historical_points_earned: 100 },
        { player_id: 2, historical_events_participated: 1, historical_points_earned: 100 },
        { player_id: 3, historical_events_participated: 1, historical_points_earned: 100 }
      ];

      const messages: PlayerMessage[] = [
        { player_id: 1, text_length: 100 },
        { player_id: 2, text_length: 300 },
        { player_id: 3, text_length: 200 }
      ];

      const result = sortPlayersByPerformance(players, 'messages_length', messages);
      
      expect(result[0].player_id).toBe(2); // 300 characters
      expect(result[1].player_id).toBe(3); // 200 characters
      expect(result[2].player_id).toBe(1); // 100 characters
    });

    it('should sort players by points_spent correctly', () => {
      const players: Player[] = [
        { player_id: 1, historical_events_participated: 1, historical_points_earned: 100 },
        { player_id: 2, historical_events_participated: 1, historical_points_earned: 100 },
        { player_id: 3, historical_events_participated: 1, historical_points_earned: 100 }
      ];

      const spends: PlayerSpend[] = [
        { player_id: 1, points_spent: 100 },
        { player_id: 2, points_spent: 300 },
        { player_id: 3, points_spent: 200 }
      ];

      const result = sortPlayersByPerformance(players, 'points_spent', undefined, spends);
      
      expect(result[0].player_id).toBe(2); // 300 points spent
      expect(result[1].player_id).toBe(3); // 200 points spent
      expect(result[2].player_id).toBe(1); // 100 points spent
    });

    it('should handle tie-break by player_id ascending', () => {
      const players: Player[] = [
        { player_id: 3, historical_events_participated: 1, historical_points_earned: 100 },
        { player_id: 1, historical_events_participated: 1, historical_points_earned: 100 },
        { player_id: 2, historical_events_participated: 1, historical_points_earned: 100 }
      ];

      const result = sortPlayersByPerformance(players, 'events_performance');
      
      // All have same average, should be sorted by player_id ascending
      expect(result[0].player_id).toBe(1);
      expect(result[1].player_id).toBe(2);
      expect(result[2].player_id).toBe(3);
    });
  });
});

