import { getCookie } from './cookie';

export const buildAuthHeaders = (): Record<string, string> => {
  const headers: Record<string, string> = {};
  const accessToken = getCookie('accessToken');
  const refreshToken = getCookie('refreshToken');
  const lastLoginTime = getCookie('lastLoginTime');

  if (accessToken) headers.accessToken = accessToken;
  if (refreshToken) headers.refreshToken = refreshToken;
  if (lastLoginTime) headers.lastLoginTime = lastLoginTime;

  return headers;
};
