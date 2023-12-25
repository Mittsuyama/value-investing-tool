import { LEADING_INDICAOTR_ITEMS } from '@renderer/constants/leading-indicator-items';
import type { StockBaseInfo, StockWithLeadingIndicators } from '@renderer/types';
import type { RPNExpression } from '@renderer/types/filter-schema';
import {
  computeAvg,
  computeStd,
  isOperation,
  computeSimpleExponentialSmoothing,
} from '@renderer/utils/expression';

const getMultiYearValue = (info: StockWithLeadingIndicators, years: number, pinyin?: string, chinese?: string) => {
  return info
    .indicators
    .slice(0, years)
    .map((item) => item[LEADING_INDICAOTR_ITEMS[`${pinyin}-${chinese}`]]);
};

export const computeRPNWithLeadingIndicators = (rpn: RPNExpression, info: StockWithLeadingIndicators, map?: Map<string, StockBaseInfo>) => {
  try {
    const stack: number[] = [];
    rpn.forEach((item) => {
      if (typeof item === 'string' && isOperation(item)) {
        const a = stack.pop();
        const b = stack.pop();
        if (!a || !b) {
          throw new Error('无效 RPN 表达式');
        }
        if (item === '*') {
          stack.push(b * a);
        } else if (item == '+') {
          stack.push(b + a);
        } else if (item === '-') {
          stack.push(b - a);
        } else {
          stack.push(b / a);
        }
      } else if (typeof item === 'string') {
        const [pinyin, chinese, year = '0'] = item.split('-');
        // 市盈率
        if (pinyin === 'pe' && map) {
          stack.push(map.get(info.id)?.ttmPe || 0);
        // 总市值
        } else if (pinyin === 'zsz' && map) {
          stack.push(map.get(info.id)?.totalMarketCap || 0);
        // 一次指数平滑
        } else if (year.startsWith('ses')) {
          stack.push(computeSimpleExponentialSmoothing(getMultiYearValue(
            info,
            Number(year[3]),
            pinyin,
            chinese,
          )));
        // 年均
        } else if (year.startsWith('avg')) {
          stack.push(computeAvg(getMultiYearValue(
            info,
            Number(year[3]),
            pinyin,
            chinese,
          )));
        // 标准差
        } else if (year.startsWith('std')) {
          stack.push(computeStd(getMultiYearValue(
            info,
            Number(year[3]),
            pinyin,
            chinese,
          )));
        // 其他指标
        } else {
          const value = info.indicators[Number(year)][LEADING_INDICAOTR_ITEMS[`${pinyin}-${chinese}`]];
          if (!value) {
            throw new Error(`缺少数据: ${info.name} ${info.id} ${year} ${pinyin}-${chinese}`);
          }
          stack.push(value);
        }
      } else {
        stack.push(item);
      }
    });
    return stack[0];
  } catch (e) {
    // console.error(e);
    return null;
  }
};
