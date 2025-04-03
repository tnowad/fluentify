"use server"

import { HttpStatus } from '@workspace/contracts';
import { setCookie } from 'cookies-next';
import { COOKIE_KEY_ACCESS_TOKEN, COOKIE_KEY_REFRESH_TOKEN } from '../lib/constants';
import { authApi } from '@/lib/api';
import { cookies } from 'next/headers';

export const refreshAccessToken = async (refreshToken: string): Promise<string | null> => {
  const cookieStore = await cookies()
  console.log('[refreshAccessToken] Attempting to refresh token...');

  const response = await authApi.refresh({ body: { refreshToken } });

  console.log('[refreshAccessToken] Response:', {
    status: response.status,
    body: response.body,
  });

  if (response.status === HttpStatus.OK) {
    const { accessToken, refreshToken: newRefreshToken } = response.body;

    console.log('[refreshAccessToken] Setting new cookies');

    // await setCookie(COOKIE_KEY_ACCESS_TOKEN, accessToken, { cookies });
    // await setCookie(COOKIE_KEY_REFRESH_TOKEN, newRefreshToken, { cookies });
    cookieStore.set(COOKIE_KEY_ACCESS_TOKEN, accessToken)
    cookieStore.set(COOKIE_KEY_REFRESH_TOKEN, newRefreshToken)

    console.log('[refreshAccessToken] Token refresh successful');
    return accessToken;
  }

  console.warn('[refreshAccessToken] Token refresh failed');
  return null;
};
