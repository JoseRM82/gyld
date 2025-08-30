import * as fs from 'fs';
import * as path from 'path';
import { 
  getDataPath, 
  getPlayersCsvPath, 
  getMessagesCsvPath, 
  getSpendsCsvPath
} from '../../utils/csvReader';

// Mock fs module
jest.mock('fs');

describe('CSV Reader Utils', () => {
  const mockFs = fs as jest.Mocked<typeof fs>;
  const originalCwd = process.cwd;

  beforeEach(() => {
    // Mock process.cwd to return a predictable path
    process.cwd = jest.fn().mockReturnValue('/mock/current/directory');
    
    // Reset all mocks
    jest.clearAllMocks();
  });

  afterEach(() => {
    // Restore original process.cwd
    process.cwd = originalCwd;
  });

  describe('Path Generation Functions', () => {
    it('should generate correct data path', () => {
      const result = getDataPath();
      const expectedPath = path.join('/mock/current/directory', '..', 'data');
      
      expect(result).toBe(expectedPath);
    });

    it('should generate correct players CSV path', () => {
      const result = getPlayersCsvPath();
      const expectedPath = path.join('/mock/current/directory', '..', 'data', 'level_a_players.csv');
      
      expect(result).toBe(expectedPath);
    });

    it('should generate correct messages CSV path', () => {
      const result = getMessagesCsvPath();
      const expectedPath = path.join('/mock/current/directory', '..', 'data', 'level_b_messages.csv');
      
      expect(result).toBe(expectedPath);
    });

    it('should generate correct spends CSV path', () => {
      const result = getSpendsCsvPath();
      const expectedPath = path.join('/mock/current/directory', '..', 'data', 'level_b_spend.csv');
      
      expect(result).toBe(expectedPath);
    });
  });

  describe('Function Existence', () => {
    it('should have loadDataBySortType function', () => {
      const { loadDataBySortType } = require('../../utils/csvReader');
      expect(typeof loadDataBySortType).toBe('function');
    });

    it('should have loadPlayers function', () => {
      const { loadPlayers } = require('../../utils/csvReader');
      expect(typeof loadPlayers).toBe('function');
    });

    it('should have loadMessages function', () => {
      const { loadMessages } = require('../../utils/csvReader');
      expect(typeof loadMessages).toBe('function');
    });

    it('should have loadSpends function', () => {
      const { loadSpends } = require('../../utils/csvReader');
      expect(typeof loadSpends).toBe('function');
    });

    it('should have readCsvFile function', () => {
      const { readCsvFile } = require('../../utils/csvReader');
      expect(typeof readCsvFile).toBe('function');
    });
  });
});

