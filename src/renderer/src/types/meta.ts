export interface MetaInfo {
  /** 指标更新时间 */
  updateTime?: Record<string, number | undefined>;

  /** 获取个股主要指标断点 */
  stocksWithLeadingIndicatorsFetchingPage?: number;
}
