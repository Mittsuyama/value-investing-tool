import { RemoteError } from './RemoteError';

export const get = async (url: string, params: any) => {
  const res = await window.electron.ipcRenderer.invoke(
    'axios',
    'get',
    url,
    params,
  );
  if (!res.isSuccess) {
    throw new RemoteError(res.status, res.message);
  }
  return res.data;
};

export const getStore = async (key: string) => {
  return await window.electron.ipcRenderer.invoke(
    'store',
    'get',
    key,
  );
};

export const setStore = async (key: string, data: any) => {
  return await window.electron.ipcRenderer.invoke(
    'store',
    'set',
    key,
    data,
  );
};

export const clearStore = async () => {
  return await window.electron.ipcRenderer.invoke(
    'store',
    'clear',
  );
};
