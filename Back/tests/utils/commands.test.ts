import { parseCommandLineArgs, SortType } from '../../utils/commands';

// Mock process.argv and process.exit
const originalArgv = process.argv;
const originalExit = process.exit;

describe('Commands Utils', () => {
  beforeEach(() => {
    // Reset process.argv before each test
    process.argv = ['node', 'script.js'];
    // Mock process.exit to prevent test termination
    process.exit = jest.fn() as any;
  });

  afterEach(() => {
    // Restore original process.argv and process.exit
    process.argv = originalArgv;
    process.exit = originalExit;
  });

  describe('parseCommandLineArgs', () => {
    it('should return default values when no arguments provided', () => {
      const result = parseCommandLineArgs();
      
      expect(result.teams).toBe(3);
      expect(result.sortType).toBe('events_performance');
    });

    it('should parse teams argument correctly', () => {
      process.argv = ['node', 'script.js', '--teams', '5'];
      
      const result = parseCommandLineArgs();
      
      expect(result.teams).toBe(5);
      expect(result.sortType).toBe('events_performance');
    });

    it('should parse events_performance sort type', () => {
      process.argv = ['node', 'script.js', '--events_performance'];
      
      const result = parseCommandLineArgs();
      
      expect(result.teams).toBe(3);
      expect(result.sortType).toBe('events_performance');
    });

    it('should parse messages_length sort type', () => {
      process.argv = ['node', 'script.js', '--messages_length'];
      
      const result = parseCommandLineArgs();
      
      expect(result.teams).toBe(3);
      expect(result.sortType).toBe('messages_length');
    });

    it('should parse points_spent sort type', () => {
      process.argv = ['node', 'script.js', '--points_spent'];
      
      const result = parseCommandLineArgs();
      
      expect(result.teams).toBe(3);
      expect(result.sortType).toBe('points_spent');
    });

    it('should parse both teams and sort type', () => {
      process.argv = ['node', 'script.js', '--teams', '7', '--points_spent'];
      
      const result = parseCommandLineArgs();
      
      expect(result.teams).toBe(7);
      expect(result.sortType).toBe('points_spent');
    });

    it('should handle arguments in different order', () => {
      process.argv = ['node', 'script.js', '--messages_length', '--teams', '4'];
      
      const result = parseCommandLineArgs();
      
      expect(result.teams).toBe(4);
      expect(result.sortType).toBe('messages_length');
    });

    it('should use last sort type if multiple provided', () => {
      process.argv = ['node', 'script.js', '--events_performance', '--messages_length', '--points_spent'];
      
      const result = parseCommandLineArgs();
      
      expect(result.teams).toBe(3);
      expect(result.sortType).toBe('points_spent');
    });

    it('should handle teams argument without value', () => {
      process.argv = ['node', 'script.js', '--teams'];
      
      const result = parseCommandLineArgs();
      
      // Should use default value when --teams has no value
      expect(result.teams).toBe(3);
      expect(result.sortType).toBe('events_performance');
    });

    it('should handle non-numeric teams value', () => {
      process.argv = ['node', 'script.js', '--teams', 'invalid'];
      
      const result = parseCommandLineArgs();
      
      // Should use default value when teams is not a number
      expect(result.teams).toBe(3);
      expect(result.sortType).toBe('events_performance');
    });

    it('should handle zero teams value', () => {
      process.argv = ['node', 'script.js', '--teams', '0'];
      
      const result = parseCommandLineArgs();
      
      expect(result.teams).toBe(0);
      expect(result.sortType).toBe('events_performance');
    });

    it('should handle negative teams value', () => {
      process.argv = ['node', 'script.js', '--teams', '-5'];
      
      const result = parseCommandLineArgs();
      
      expect(result.teams).toBe(-5);
      expect(result.sortType).toBe('events_performance');
    });
  });
});

