import type { FinancialReportData } from '@renderer/types';
import { LEADING_INDICAOTR_ITEMS } from '@renderer/constants/leading-indicator-items';
import type { RPNExpression } from '@renderer/types/filter-schema';
import { isOperation } from '@renderer/utils/expression';
import { ACCOUNT_ITEM } from '@renderer/constants';

/** 未找到用 0 替代 */
const isReplaceWithZeroWhenNotFound = (str: string) => {
  if (/\[r0\]/.test(str)) {
    return {
      replaceByZero: true,
      str: str.replace('[r0]', ''),
    };
  }
  return {
    replaceByZero: false,
    str,
  };
};

export const computeFinancialReportData = (rpn: RPNExpression, reports: FinancialReportData[], currentYear: number) => {
  try {
    const stack: number[] = [];
    rpn.forEach((item) => {
      if (typeof item === 'string' && isOperation(item)) {
        const a = stack.pop();
        const b = stack.pop();
        if (a === undefined || b === undefined) {
          console.error(rpn);
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
        let key = '';
        let year = 0;
        const { str, replaceByZero } = isReplaceWithZeroWhenNotFound(item);
        if (str.startsWith('l-') || str.startsWith('z-') || str.startsWith('x-')) {
          const [prefix, pinyin, chinese, yearStr = '0'] = str.split('-');
          key = ACCOUNT_ITEM[`${prefix}-${pinyin}-${chinese}`];
          year = Number(yearStr);
        } else {
          const [pinyin, chinese, yearStr = '0'] = str.split('-');
          key = LEADING_INDICAOTR_ITEMS[`${pinyin}-${chinese}`];
          year = Number(yearStr);
        }
        const value = Number(reports[currentYear + year][key]);
        if (!value && !replaceByZero) {
          throw new Error(`缺少数据: ${currentYear + year} ${key}`);
        }
        if (!value && replaceByZero) {
          stack.push(0);
        } else {
          stack.push(value);
        }
      } else {
        stack.push(item);
      }
    });
    const res = stack[0];
    if (!Number.isFinite(res)) {
      return NaN;
    }
    return res;
  } catch (e) {
    // console.error(e);
    return null;
  }
};
