import { ipcMain } from 'electron';
import Store from 'electron-store';

export const createStoreIpcHandle = () => {
  const store = new Store();
  ipcMain.handle('store', (_, func: string, ...params: any[]) => {
    return store[func](...params);
  });
};

