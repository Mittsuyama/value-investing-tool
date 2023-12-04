import Dexie, { Table } from 'dexie';
import { StockBaseInfo, StockWithLeadingIndicators } from '@renderer/types';

export class Database extends Dexie {
  stockBaseInfoList!: Table<StockBaseInfo>;
  stockWithLeadingIndicatorsList!: Table<StockWithLeadingIndicators>;

  constructor() {
    super('value-investing-tool');
    this.version(1).stores({
      stockBaseInfoList: '&id',
    });
    this.version(2).stores({
      stockWithLeadingIndicatorsList: '&id',
    });
  }
}

export const db = new Database();

