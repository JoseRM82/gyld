import * as fs from 'fs';
import * as path from 'path';
import csv from 'csv-parser';
import { Player, PlayerMessage, PlayerSpend } from '../users/interfaces';

export function readCsvFile<T>(filePath: string, mapper: (row: any) => T): Promise<T[]> {
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

export function getDataPath(): string {
  return path.join(process.cwd(), '..', 'data');
}

export function getPlayersCsvPath(): string {
  return path.join(getDataPath(), 'level_a_players.csv');
}

export function getMessagesCsvPath(): string {
  return path.join(getDataPath(), 'level_b_messages.csv');
}

export function getSpendsCsvPath(): string {
  return path.join(getDataPath(), 'level_b_spend.csv');
}

export async function loadPlayers(): Promise<Player[]> {
  const playersCsvPath = getPlayersCsvPath();
  return await readCsvFile<Player>(playersCsvPath, (row: any) => ({
    player_id: parseInt(row.player_id),
    historical_points_earned: parseInt(row.historical_points_earned),
    historical_events_participated: parseInt(row.historical_events_participated)
  }));
}

export async function loadMessages(): Promise<PlayerMessage[]> {
  const messagesCsvPath = getMessagesCsvPath();
  return await readCsvFile<PlayerMessage>(messagesCsvPath, (row: any) => ({
    player_id: parseInt(row.player_id),
    text_length: parseInt(row.text_length)
  }));
}

export async function loadSpends(): Promise<PlayerSpend[]> {
  const spendsCsvPath = getSpendsCsvPath();
  return await readCsvFile<PlayerSpend>(spendsCsvPath, (row: any) => ({
    player_id: parseInt(row.player_id),
    points_spent: parseInt(row.points_spent)
  }));
}

export async function loadDataBySortType(sortType: 'events_performance' | 'messages_length' | 'points_spent'): Promise<{
  players: Player[];
  messages?: PlayerMessage[];
  spends?: PlayerSpend[];
}> {
  const players = await loadPlayers();
  
  let messages: PlayerMessage[] | undefined;
  let spends: PlayerSpend[] | undefined;
  
  if (sortType === 'messages_length') {
    messages = await loadMessages();
  }
  
  if (sortType === 'points_spent') {
    spends = await loadSpends();
  }
  
  return { players, messages, spends };
}
