import { NextResponse } from 'next/server';
import { HttpStatus } from '@workspace/contracts';
import { COOKIE_KEY_ACCESS_TOKEN, COOKIE_KEY_REFRESH_TOKEN } from '@/lib/constants';
import { authApi } from '@/lib/api';

export async function POST(req: Request) {
  const { refreshToken } = await req.json();

  if (!refreshToken) {
    return NextResponse.json({ message: 'Missing refreshToken' }, { status: HttpStatus.BAD_REQUEST });
  }

  const response = await authApi.refresh({ body: { refreshToken } });

  if (response.status !== HttpStatus.OK) {
    return NextResponse.json({ message: 'Failed to refresh token' }, { status: response.status });
  }

  const { accessToken, refreshToken: newRefreshToken } = response.body;

  const res = NextResponse.json({ accessToken });

  res.cookies.set(COOKIE_KEY_ACCESS_TOKEN, accessToken, {
    httpOnly: true,
    secure: true,
    path: '/',
    sameSite: 'strict',
  });

  res.cookies.set(COOKIE_KEY_REFRESH_TOKEN, newRefreshToken, {
    httpOnly: true,
    secure: true,
    path: '/',
    sameSite: 'strict',
  });

  return res;
}
