import { initContract } from '@ts-rest/core';
import { z } from 'zod';
import { ConflictResponse, UnauthorizedResponse, ValidationErrorResponse } from './common/responses';

const c = initContract();

const UserSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  name: z.string(),
});

const TokenPairSchema = z.object({
  accessToken: z.string(),
  refreshToken: z.string(),
});

const BadRequestTokenError = z.object({
  error: z.literal('Bad Request'),
  message: z.literal('Invalid or expired token'),
});

const LoginRequest = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

const RegisterRequest = LoginRequest.extend({
  name: z.string().min(1),
});

const RefreshRequest = z.object({
  refreshToken: z.string(),
});

const LogoutRequest = RefreshRequest;

const EmailVerificationRequest = z.object({
  token: z.string(),
});

const ForgotPasswordRequest = z.object({
  email: z.string().email(),
});

const ResetPasswordRequest = z.object({
  token: z.string(),
  newPassword: z.string().min(6),
});

const AuthSuccessResponse = TokenPairSchema.extend({
  user: UserSchema,
});

export const authContract = c.router({
  login: {
    method: 'POST',
    path: '/auth/login',
    summary: 'Login to the application',
    body: LoginRequest,
    responses: {
      200: AuthSuccessResponse,
      401: UnauthorizedResponse,
      422: ValidationErrorResponse,
    },
  },
  register: {
    method: 'POST',
    path: '/auth/register',
    summary: 'Register a new user',
    body: RegisterRequest,
    responses: {
      201: AuthSuccessResponse,
      409: ConflictResponse,
      422: ValidationErrorResponse,
    },
  },
  refresh: {
    method: 'POST',
    path: '/auth/refresh',
    summary: 'Refresh access token',
    body: RefreshRequest,
    responses: {
      200: TokenPairSchema,
      401: UnauthorizedResponse,
    },
  },
  me: {
    method: 'GET',
    path: '/auth/me',
    summary: 'Get current user info',
    responses: {
      200: UserSchema,
      401: UnauthorizedResponse,
    },
  },
  logout: {
    method: 'POST',
    path: '/auth/logout',
    summary: 'Logout user',
    body: LogoutRequest,
    responses: {
      204: z.null(),
      401: UnauthorizedResponse,
    },
  },
  verifyEmail: {
    method: 'POST',
    path: '/auth/verify-email',
    summary: 'Verify email with token',
    body: EmailVerificationRequest,
    responses: {
      204: z.null(),
      400: BadRequestTokenError,
    },
  },
  forgotPassword: {
    method: 'POST',
    path: '/auth/forgot-password',
    summary: 'Send password reset email',
    body: ForgotPasswordRequest,
    responses: {
      204: z.null(),
    },
  },
  resetPassword: {
    method: 'POST',
    path: '/auth/reset-password',
    summary: 'Reset password with token',
    body: ResetPasswordRequest,
    responses: {
      204: z.null(),
      400: BadRequestTokenError,
      422: ValidationErrorResponse,
    },
  },
});
