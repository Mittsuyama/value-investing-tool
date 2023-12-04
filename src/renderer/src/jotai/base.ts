import { atom } from 'jotai';
import { StockBaseInfo } from '@renderer/types';

export const stockBaseInfosAtom = atom<StockBaseInfo[]>([]);
