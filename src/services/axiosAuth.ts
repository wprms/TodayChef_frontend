import axios from 'axios';
import { getCookie, setCookie } from '../utils/cookie';

let configured = false;

const readHeader = (headers: unknown, key: string): string | null => {
  if (!headers || typeof headers !== 'object') {
    return null;
  }

  const record = headers as Record<string, unknown>;
  const target = record[key.toLowerCase()] ?? record[key];
  if (typeof target === 'string' && target.length > 0) {
    return target;
  }
  return null;
};

export const setupAxiosAuth = () => {
  if (configured) {
    return;
  }

  axios.interceptors.request.use((config) => {
    const accessToken = getCookie('accessToken');
    const refreshToken = getCookie('refreshToken');
    const lastLoginTime = getCookie('lastLoginTime');

    config.withCredentials = true;
    config.headers = config.headers ?? {};

    if (accessToken) {
      (config.headers as Record<string, string>).accessToken = accessToken;
    }
    if (refreshToken) {
      (config.headers as Record<string, string>).refreshToken = refreshToken;
    }
    if (lastLoginTime) {
      (config.headers as Record<string, string>).lastLoginTime = lastLoginTime;
    }

    return config;
  });

  axios.interceptors.response.use(
    (response) => {
      const accessToken = readHeader(response.headers, 'accesstoken');
      const refreshToken = readHeader(response.headers, 'refreshtoken');
      const lastLoginTime = readHeader(response.headers, 'lastlogintime');

      if (accessToken) {
        setCookie('accessToken', accessToken, 1);
      }
      if (refreshToken) {
        setCookie('refreshToken', refreshToken, 1);
      }
      if (lastLoginTime) {
        setCookie('lastLoginTime', lastLoginTime, 1);
      }
      return response;
    },
    (error) => Promise.reject(error),
  );

  configured = true;
};
