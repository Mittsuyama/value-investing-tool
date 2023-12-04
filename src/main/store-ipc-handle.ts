import { App, ipcMain, shell } from 'electron';
import path from 'path';
import Store from 'electron-store';

export const createStoreIpcHandle = (app: App) => {
  const store = new Store();
  ipcMain.handle('store', (_, func: string, ...params: any[]) => {
    return store[func](...params);
  });

  ipcMain.handle('getAppUserDataPath', () => {
    return app.getPath('userData');
  });

  ipcMain.handle('getAppUserDataFile', () => {
    return path.resolve(app.getPath('userData'), './config.json');
  });

  ipcMain.handle('openPath', async (_, path: string) => {
    return await shell.openPath(path);
  });
};

