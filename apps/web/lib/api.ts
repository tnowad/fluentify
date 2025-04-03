import { initClient, tsRestFetchApi } from '@ts-rest/core';
import { apiContracts, authContract, HttpStatus } from '@workspace/contracts';
import { getCookie, setCookie } from 'cookies-next';
import { jwtDecode } from 'jwt-decode';
import { COOKIE_KEY_ACCESS_TOKEN, COOKIE_KEY_REFRESH_TOKEN } from './constants';

const apiConfig = {
  baseUrl: 'http://127.0.0.1:3200',
  baseHeaders: {
    'Content-Type': 'application/json',
  },
};

const authApi = initClient(authContract, apiConfig);

const isJwtExpired = (token: string): boolean => {
  try {
    const { exp } = jwtDecode<{ exp: number }>(token);
    return exp * 1000 < Date.now();
  } catch {
    return true;
  }
};

const refreshAccessToken = async (refreshToken: string): Promise<string | null> => {
  const response = await authApi.refresh({ body: { refreshToken } });

  if (response.status === HttpStatus.OK) {
    const { accessToken, refreshToken: newRefreshToken } = response.body;
    await setCookie(COOKIE_KEY_ACCESS_TOKEN, accessToken, { path: '/' });
    await setCookie(COOKIE_KEY_REFRESH_TOKEN, newRefreshToken, { path: '/' });
    return accessToken;
  }

  return null;
};

const getAccessToken = async (): Promise<string | null> => {
  const accessToken = await getCookie(COOKIE_KEY_ACCESS_TOKEN);
  const refreshToken = await getCookie(COOKIE_KEY_REFRESH_TOKEN);

  if (accessToken && !isJwtExpired(accessToken)) return accessToken;
  if (refreshToken && !isJwtExpired(refreshToken)) return await refreshAccessToken(refreshToken);

  return null;
};

export const api = initClient(apiContracts, {
  ...apiConfig,
  api: async (args) => {
    const accessToken = await getAccessToken();
    return tsRestFetchApi({
      ...args,
      headers: {
        ...args.headers,
        ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      },
    });
  },
});
