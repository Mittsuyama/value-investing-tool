export const getAppUserDataPath = async (): Promise<string> => {
  return await window.electron.ipcRenderer.invoke(
    'getAppUserDataPath',
  );
};

export const getAppUserDataFile = async (): Promise<string> => {
  return await window.electron.ipcRenderer.invoke(
    'getAppUserDataFile',
  );
};

export const openPath = async (path: string): Promise<void> => {
  return await window.electron.ipcRenderer.invoke(
    'openPath',
    path,
  );
};
