import type { OperationType, RPNExpression } from '@renderer/types/filter-schema';

export const isOperation = (str: string): str is OperationType => {
  const operations = ['+', '-', '*', '/'];
  return operations.includes(str);
};

export const computeAvg = (ars: number[]): number => {
  const sum = ars
    .reduce((prev, curr) => {
      return prev + curr;
    }, 0);
  return sum / ars.length;
};

export const computeStd = (ars: number[]): number => {
  const avg = computeAvg(ars);
  const sum = ars.reduce((prev, curr) => {
    return Math.pow(curr - avg, 2) + prev;
  }, 0);
  return Math.sqrt(sum) / ars.length;
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
      // const [pinyin, chinese, year] = tmpVariable.split('-');
      // result.push(`${pinyin}${chinese ? '-' + chinese : ''}${year ? '-' + year : ''}`);
      result.push(tmpVariable);
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
    // const [pinyin, chinese, year] = (tmpVariable || '').split('-');
    result.push(tmpVariable);
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
