import type { DatabaseInfo } from '@renderer/types';
import { getStore, setStore } from '@renderer/api/utils';

export const getDatabaseInfo = async (): Promise<DatabaseInfo> => {
  const stocks = await getStore('database-info') || {};
  return stocks;
};

export const setDatabaseInfo = async (info: DatabaseInfo) => {
  return await setStore('database-info', info);
};

export const getAppUserDataPath = async (): Promise<string> => {
  return await window.electron.ipcRenderer.invoke(
    'getAppUserDataPath',
  );
};

export const openPath = async (path: string): Promise<void> => {
  return await window.electron.ipcRenderer.invoke(
    'openPath',
    path,
  );
};
