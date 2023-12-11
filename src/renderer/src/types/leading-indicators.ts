import { StockBaseInfo } from './stock-base-info';

export interface LeadingIndicators {
  /** 出报时间 */
  reportYear: number;

  /** 出报时间（中文） */
  REPORT_DATE_NAME: string;
}

export interface StockWithLeadingIndicators extends Pick<
  StockBaseInfo,
  'id'
  | 'code'
  | 'stockExchangeName'
  | 'name'
> {
  indicators: LeadingIndicators[];
  updateTime?: number;
}
