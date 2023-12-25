import Dexie, { Table } from 'dexie';
import { StockBaseInfo, StockWithFinancialReportData, StockWithLeadingIndicators } from '@renderer/types';

export class Database extends Dexie {
  stockBaseInfoList!: Table<StockBaseInfo>;
  stockWithLeadingIndicatorsList!: Table<StockWithLeadingIndicators>;
  stockWithFRD!: Table<StockWithFinancialReportData>;

  constructor() {
    super('value-investing-tool');
    this.version(1).stores({
      stockBaseInfoList: '&id',
    });
    this.version(2).stores({
      stockWithLeadingIndicatorsList: '&id',
    });
    this.version(4).stores({
      stockWithFRD: '&id',
    });
  }
}

export const db = new Database();

