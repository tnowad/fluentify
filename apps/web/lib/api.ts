import { initClient, tsRestFetchApi } from '@ts-rest/core';
import { apiContracts, authContract, HttpStatus } from '@workspace/contracts';
import { CookiesFn, getCookie, setCookie } from 'cookies-next';
import { jwtDecode } from 'jwt-decode';
import { COOKIE_KEY_ACCESS_TOKEN, COOKIE_KEY_REFRESH_TOKEN } from './constants';
import { isServer } from '@tanstack/react-query';
import { refreshAccessToken } from '@/actions/refresh-token.action';

const apiConfig = {
  baseUrl: 'http://127.0.0.1:3200',
  baseHeaders: {
    'Content-Type': 'application/json',
  },
};

export const authApi = initClient(authContract, apiConfig);

const isJwtExpired = (token: string): boolean => {
  try {
    const { exp } = jwtDecode<{ exp: number }>(token);
    return exp * 1000 < Date.now();
  } catch {
    return true;
  }
};

const getAccessToken = async (): Promise<string | null> => {
  let cookies: CookiesFn | undefined = undefined;

  if (isServer) {
    const headers = await import("next/headers");
    cookies = headers.cookies;
  }

  const accessToken = await getCookie(COOKIE_KEY_ACCESS_TOKEN, { cookies });
  const refreshToken = await getCookie(COOKIE_KEY_REFRESH_TOKEN, { cookies });

  console.log('[getAccessToken] Access Token:', !!accessToken ? 'Found' : 'Not Found');
  console.log('[getAccessToken] Refresh Token:', !!refreshToken ? 'Found' : 'Not Found');

  if (accessToken && !isJwtExpired(accessToken)) {
    console.log('[getAccessToken] Access token valid');
    return accessToken;
  }

  if (!refreshToken) {
    console.warn('[getAccessToken] No refresh token');
    return null;
  }

  if (isJwtExpired(refreshToken)) {
    console.warn('[getAccessToken] Refresh token expired');
    return null;
  }

  console.log('[getAccessToken] Refreshing access token...');
  try {
    const res = await fetch(`http://127.0.0.1:3000/api/auth/refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refreshToken }),
      credentials: 'include',
    });

    console.log('[getAccessToken] Refresh API response status:', res.status);

    if (!res.ok) {
      console.warn('[getAccessToken] Token refresh failed:', res.statusText);
      return null;
    }

    const data = await res.json();
    console.log('[getAccessToken] New access token received');

    return data.accessToken ?? null;
  } catch (err) {
    console.error('[getAccessToken] Token refresh error:', err);
    return null;
  }
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
