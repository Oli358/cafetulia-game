import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';

export const roomsTable = sqliteTable('rooms', {
  code: text('code').primaryKey(),
  hostId: text('host_id').notNull(),
  phase: text('phase').notNull(), // 'lobby' | 'playing' | 'finished'
  configJson: text('config_json').notNull(),
  stateJson: text('state_json'),
  createdAt: integer('created_at').notNull(),
  updatedAt: integer('updated_at').notNull(),
});

export const moveEventsTable = sqliteTable('move_events', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  roomCode: text('room_code').notNull(),
  turnNumber: integer('turn_number').notNull(),
  playerId: text('player_id').notNull(),
  moveJson: text('move_json').notNull(),
  eventsJson: text('events_json').notNull(),
  createdAt: integer('created_at').notNull(),
});

export const matchHistoryTable = sqliteTable('match_history', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  roomCode: text('room_code').notNull(),
  winnersJson: text('winners_json').notNull(),
  scoresJson: text('scores_json').notNull(),
  playersJson: text('players_json').notNull(),
  terminalReason: text('terminal_reason').notNull(),
  finishedAt: integer('finished_at').notNull(),
});
