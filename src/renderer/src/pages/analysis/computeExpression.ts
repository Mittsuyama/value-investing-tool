import { LEADING_INDICAOTR_ITEMS } from '@renderer/constants/leading-indicator-items';
import type { StockBaseInfo, StockWithLeadingIndicators } from '@renderer/types';
import type { OperationType, RPNExpression } from '@renderer/types/filter-schema';

export const isOperation = (str: string): str is OperationType => {
  const operations = ['+', '-', '*', '/'];
  return operations.includes(str);
};

export const transferToRPN = (expression: string) => {
  const opStack: Array<OperationType | '(' | ')'> = [];
  const result: RPNExpression = [];
  let tmpNumber: null | number = null;
  let tmpVariable: null | string = null;
  let isVariable = false;

  for (const ch of expression) {
    // 变量结束
    if (/[\s()]/.test(ch) && isVariable) {
      if (!tmpVariable) {
        throw new Error('「@」后存在「空白」或「括号」字符');
      }
      const [pinyin, chinese, year = 0] = tmpVariable.split('-');
      result.push(`${pinyin}-${chinese}-${year}`);
      tmpVariable = null;
      isVariable = false;
    }
    if (isVariable) {
      tmpVariable = (tmpVariable || '') + ch;
      continue;
    }
    if (!/\s/.test(ch) && !Number.isNaN(Number(ch))) {
      tmpNumber = (tmpNumber || 0) * 10 + Number(ch);
      continue;
    }
    if (tmpNumber !==  null) {
      result.push(tmpNumber);
      tmpNumber = null;
    }
    if (ch === '@') {
      isVariable = true;
      continue;
    }
    if (ch === '(') {
      opStack.push('(');
      continue;
    }
    if (ch === ')') {
      let isPaired = false;
      while (opStack.length) {
        const top = opStack[opStack.length - 1];
        if (top !== '(' && top !== ')') {
          result.push(top);
          opStack.pop();
        } else if (top === '(') {
          opStack.pop();
          isPaired = true;
          break;
        }
      }
      if (!isPaired) {
        throw new Error('存在未配对的 ")" 符号');
      }
    }
    if (ch === '+' || ch === '-') {
      while (opStack.length) {
        const top = opStack[opStack.length - 1];
        if (top === '*' || top === '/' || top === '+' || top === '-') {
          result.push(top);
          opStack.pop();
        } else {
          break;
        }
      }
      opStack.push(ch);
      continue;
    }
    if (ch === '*' || ch === '/') {
      while (opStack.length) {
        const top = opStack[opStack.length - 1];
        if (top === '*' || top === '/') {
          result.push(top);
          opStack.pop();
        } else {
          break;
        }
      }
      opStack.push(ch);
      continue;
    }
  }

  // 清空栈
  if (tmpVariable !== null) {
    const [pinyin, chinese, year = 0] = (tmpVariable || '').split('-');
    result.push(`${pinyin}-${chinese}-${year}`);
  }

  if (tmpNumber !== null) {
    result.push(tmpNumber);
  }

  while (opStack.length) {
    const top = opStack.pop();
    if (top) {
      if (top === '(' || top === ')') {
        throw new Error('存在多余的括号');
      }
      result.push(top);
    }
  }

  const signList = result.filter((item) => typeof item === 'string' && isOperation(item));

  if (signList.length > result.length - signList.length - 1) {
    throw new Error('存在多余的运算符')
  }
  if (signList.length < result.length - signList.length - 1)  {
    throw new Error('存在多余数字或变量');
  }

  return result;
};

export const computeRPN = (rpn: RPNExpression, info: StockWithLeadingIndicators, map?: Map<string, StockBaseInfo>) => {
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
        const [pinyin, chinese, year = 0] = item.split('-');
        if (pinyin === 'pe' && map) {
          stack.push(map.get(info.id)?.ttmPe || 0);
        } else if (pinyin === 'zsz' && map) {
          stack.push(map.get(info.id)?.totalMarketCap || 0);
        } else {
          const value = info.indicators[year][LEADING_INDICAOTR_ITEMS[`${pinyin}-${chinese}`]];
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
