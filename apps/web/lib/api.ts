import { initClient, tsRestFetchApi } from '@ts-rest/core';
import { apiContracts, authContract, HttpStatus } from '@workspace/contracts';
import { CookiesFn, getCookie, setCookie } from 'cookies-next';
import { jwtDecode } from 'jwt-decode';
import { COOKIE_KEY_ACCESS_TOKEN, COOKIE_KEY_REFRESH_TOKEN } from './constants';
import { isServer } from '@tanstack/react-query';

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
  } catch (err) {
    console.error('[isJwtExpired] JWT decode error:', err);
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

  console.log('[getAccessToken] Access Token:', accessToken ? 'Found' : 'Not Found');
  console.log('[getAccessToken] Refresh Token:', refreshToken ? 'Found' : 'Not Found');

  if (accessToken && !isJwtExpired(accessToken)) {
    console.log('[getAccessToken] Access token valid');
    return accessToken;
  }

  if (!refreshToken) {
    console.warn('[getAccessToken] No refresh token found');
    return null;
  }

  if (isJwtExpired(refreshToken)) {
    console.warn('[getAccessToken] Refresh token expired');
    return null;
  }

  console.log('[getAccessToken] Refreshing access token...');
  const response = await authApi.refresh({ body: { refreshToken } });
  console.log('[getAccessToken] Token refresh response:', {
    status: response.status,
    body: response.body,
  });

  if (response.status !== HttpStatus.OK) {
    console.warn('[getAccessToken] Token refresh failed with status:', response.status);
    return null;
  }

  const { accessToken: newAccessToken, refreshToken: newRefreshToken } = response.body;
  console.log('[getAccessToken] Tokens refreshed successfully');
  console.log('[getAccessToken] Setting new cookies');

  await setCookie(COOKIE_KEY_ACCESS_TOKEN, newAccessToken, { cookies });
  await setCookie(COOKIE_KEY_REFRESH_TOKEN, newRefreshToken, { cookies });
  console.log('[getAccessToken] New cookies set successfully');

  return newAccessToken;
};

export const api = initClient(apiContracts, {
  ...apiConfig,
  api: async (args) => {
    console.log('[api] Starting API request with args:', args);

    const accessToken = await getAccessToken();
    if (accessToken) {
      console.log('[api] Adding Authorization header with Access Token');
    } else {
      console.warn('[api] No Access Token, proceeding without Authorization header');
    }

    const response = await tsRestFetchApi({
      ...args,
      headers: {
        ...args.headers,
        ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      },
    });

    console.log('[api] API request completed with response status:', response.status);
    console.log('[api] Response body:', response.body);

    return response;
  },
});
