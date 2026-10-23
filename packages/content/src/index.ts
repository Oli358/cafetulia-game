import boardJson from '../board.json' with { type: 'json' };

export type NationCode =
  | 'af'
  | 'it'
  | 'ch'
  | 'es'
  | 'ru'
  | 'in'
  | 'am'
  | 'al'
  | 'tu'
  | 'cu'
  | 'en'
  | 'fr';

export type NationDefinition = {
  code: NationCode;
  name: string;
};

export type TableDefinition = {
  id: string;
  nation: NationCode;
  row: number;
  col: number;
};

export type SeatDefinition = {
  id: string;
  row: number;
  col: number;
  tableIds: string[];
  allowedNations: NationCode[];
  shared: boolean;
};

export type BarSlotDefinition = {
  index: number;
  value: number;
};

export type BoardData = {
  version: number;
  grid: {
    rows: number;
    cols: number;
  };
  nations: NationDefinition[];
  tables: TableDefinition[];
  seats: SeatDefinition[];
  bar: BarSlotDefinition[];
};

export const boardData: BoardData = boardJson as BoardData;
export default boardData;
