import { ipcMain } from 'electron';
import axios from 'axios';

export const createAxiosIpcHandle = () => {
  ipcMain.handle('axios', async (_, method: string, url: string, params: any) => {
    try {
      if (method === 'get') {
        console.log('ipcMian - axios/get: ', url);
        const { data } = await axios.get(url, { params });
        return {
          isSuccess: true,
          data,
        };
      }
      if (method === 'put') {
        console.log('ipcMian - axios/put: ', url);
        const { data } = await axios.put(url, params);
        return {
          isSuccess: true,
          data,
        };
      }
      return {
        isSuccess: false,
        status: 400,
        message: 'method must be get/put',
      };
    } catch (e: any) {
      return {
        isSuccess: false,
        status: e.status || 500,
        message: e.message || e.errorMessage || 'unknown error',
      };
    }
  });
};

