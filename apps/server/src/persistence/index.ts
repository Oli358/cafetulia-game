import fs from 'node:fs';
import path from 'node:path';
import { DatabaseSync } from 'node:sqlite';
import type {
  FinalScoreSummary,
  GameState,
  Move,
  MoveEvent,
  PlayerId,
  TerminalReason,
} from '@cafetulia/engine';
import { roomsTable, moveEventsTable, matchHistoryTable } from './schema.js';

export { roomsTable, moveEventsTable, matchHistoryTable };

export type RoomConfigSettings = {
  maxPlayers: 2 | 3 | 4;
  botCount: 0 | 1 | 2 | 3;
  botDifficulty: 'basic' | 'medium' | 'hard';
  timerEnabled: boolean;
  timerSeconds: number; // max 180
  allowNegativeScore: boolean;
};

export type PersistedRoomRecord = {
  code: string;
  hostId: string;
  phase: 'lobby' | 'playing' | 'finished';
  config: RoomConfigSettings;
  state: GameState | null;
  createdAt: number;
  updatedAt: number;
};

export type PersistedMoveRecord = {
  id: number;
  roomCode: string;
  turnNumber: number;
  playerId: string;
  move: Move;
  events: MoveEvent[];
  createdAt: number;
};

export type MatchHistoryRecord = {
  id: number;
  roomCode: string;
  winners: PlayerId[];
  scores: Record<PlayerId, FinalScoreSummary>;
  players: { id: string; nickname: string; isBot?: boolean }[];
  terminalReason: TerminalReason;
  finishedAt: number;
};

export class GamePersistenceStore {
  private readonly db: DatabaseSync;

  constructor(dbPath: string = ':memory:') {
    let resolvedPath = dbPath;
    if (resolvedPath !== ':memory:') {
      try {
        const dir = path.dirname(resolvedPath);
        if (dir && dir !== '.') {
          fs.mkdirSync(dir, { recursive: true });
        }
        this.db = new DatabaseSync(resolvedPath);
      } catch {
        resolvedPath = ':memory:';
        this.db = new DatabaseSync(':memory:');
      }
    } else {
      this.db = new DatabaseSync(':memory:');
    }
    this.initSchema();
  }

  private initSchema(): void {
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS rooms (
        code TEXT PRIMARY KEY,
        host_id TEXT NOT NULL,
        phase TEXT NOT NULL,
        config_json TEXT NOT NULL,
        state_json TEXT,
        created_at INTEGER NOT NULL,
        updated_at INTEGER NOT NULL
      );

      CREATE TABLE IF NOT EXISTS move_events (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        room_code TEXT NOT NULL,
        turn_number INTEGER NOT NULL,
        player_id TEXT NOT NULL,
        move_json TEXT NOT NULL,
        events_json TEXT NOT NULL,
        created_at INTEGER NOT NULL
      );

      CREATE TABLE IF NOT EXISTS match_history (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        room_code TEXT NOT NULL,
        winners_json TEXT NOT NULL,
        scores_json TEXT NOT NULL,
        players_json TEXT NOT NULL,
        terminal_reason TEXT NOT NULL,
        finished_at INTEGER NOT NULL
      );
    `);
  }

  public saveRoom(record: {
    code: string;
    hostId: string;
    phase: 'lobby' | 'playing' | 'finished';
    config: RoomConfigSettings;
    state: GameState | null;
  }): void {
    const now = Date.now();
    const stmt = this.db.prepare(`
      INSERT INTO rooms (code, host_id, phase, config_json, state_json, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(code) DO UPDATE SET
        host_id = excluded.host_id,
        phase = excluded.phase,
        config_json = excluded.config_json,
        state_json = excluded.state_json,
        updated_at = excluded.updated_at
    `);
    stmt.run(
      record.code,
      record.hostId,
      record.phase,
      JSON.stringify(record.config),
      record.state ? JSON.stringify(record.state) : null,
      now,
      now,
    );
  }

  public getRoom(code: string): PersistedRoomRecord | null {
    const stmt = this.db.prepare(`
      SELECT code, host_id, phase, config_json, state_json, created_at, updated_at
      FROM rooms
      WHERE code = ?
    `);
    const row = stmt.get(code.toUpperCase()) as
      | {
          code: string;
          host_id: string;
          phase: 'lobby' | 'playing' | 'finished';
          config_json: string;
          state_json: string | null;
          created_at: number;
          updated_at: number;
        }
      | undefined;

    if (!row) {
      return null;
    }

    return {
      code: row.code,
      hostId: row.host_id,
      phase: row.phase,
      config: JSON.parse(row.config_json) as RoomConfigSettings,
      state: row.state_json ? (JSON.parse(row.state_json) as GameState) : null,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }

  public recordMoveEvent(params: {
    roomCode: string;
    turnNumber: number;
    playerId: string;
    move: Move;
    events: MoveEvent[];
  }): void {
    const stmt = this.db.prepare(`
      INSERT INTO move_events (room_code, turn_number, player_id, move_json, events_json, created_at)
      VALUES (?, ?, ?, ?, ?, ?)
    `);
    stmt.run(
      params.roomCode.toUpperCase(),
      params.turnNumber,
      params.playerId,
      JSON.stringify(params.move),
      JSON.stringify(params.events),
      Date.now(),
    );
  }

  public getRoomMoveEvents(roomCode: string): PersistedMoveRecord[] {
    const stmt = this.db.prepare(`
      SELECT id, room_code, turn_number, player_id, move_json, events_json, created_at
      FROM move_events
      WHERE room_code = ?
      ORDER BY id ASC
    `);
    const rows = stmt.all(roomCode.toUpperCase()) as {
      id: number;
      room_code: string;
      turn_number: number;
      player_id: string;
      move_json: string;
      events_json: string;
      created_at: number;
    }[];

    return rows.map((r) => ({
      id: r.id,
      roomCode: r.room_code,
      turnNumber: r.turn_number,
      playerId: r.player_id,
      move: JSON.parse(r.move_json) as Move,
      events: JSON.parse(r.events_json) as MoveEvent[],
      createdAt: r.created_at,
    }));
  }

  /**
   * Saves a finished match to the history table and trims older entries so only the 5 most recent matches remain.
   */
  public recordMatchFinished(params: {
    roomCode: string;
    winners: PlayerId[];
    scores: Record<PlayerId, FinalScoreSummary>;
    players: { id: string; nickname: string; isBot?: boolean }[];
    terminalReason: TerminalReason;
  }): void {
    const insertStmt = this.db.prepare(`
      INSERT INTO match_history (room_code, winners_json, scores_json, players_json, terminal_reason, finished_at)
      VALUES (?, ?, ?, ?, ?, ?)
    `);
    insertStmt.run(
      params.roomCode.toUpperCase(),
      JSON.stringify(params.winners),
      JSON.stringify(params.scores),
      JSON.stringify(params.players),
      params.terminalReason,
      Date.now(),
    );

    // Keep only the 5 most recent matches
    const trimStmt = this.db.prepare(`
      DELETE FROM match_history
      WHERE id NOT IN (
        SELECT id FROM match_history ORDER BY finished_at DESC, id DESC LIMIT 5
      )
    `);
    trimStmt.run();
  }

  public getRecentMatches(limit: number = 5): MatchHistoryRecord[] {
    const stmt = this.db.prepare(`
      SELECT id, room_code, winners_json, scores_json, players_json, terminal_reason, finished_at
      FROM match_history
      ORDER BY finished_at DESC, id DESC
      LIMIT ?
    `);
    const rows = stmt.all(Math.min(5, Math.max(1, limit))) as {
      id: number;
      room_code: string;
      winners_json: string;
      scores_json: string;
      players_json: string;
      terminal_reason: TerminalReason;
      finished_at: number;
    }[];

    return rows.map((r) => ({
      id: r.id,
      roomCode: r.room_code,
      winners: JSON.parse(r.winners_json) as PlayerId[],
      scores: JSON.parse(r.scores_json) as Record<PlayerId, FinalScoreSummary>,
      players: JSON.parse(r.players_json) as { id: string; nickname: string; isBot?: boolean }[],
      terminalReason: r.terminal_reason,
      finishedAt: r.finished_at,
    }));
  }

  public close(): void {
    this.db.close();
  }
}

export const defaultPersistenceStore = new GamePersistenceStore(
  process.env.SQLITE_DB_PATH ?? process.env.DATABASE_URL ?? ':memory:',
);
