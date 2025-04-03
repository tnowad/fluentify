import { initContract } from '@ts-rest/core';
import { z } from 'zod';
import {
  UnauthorizedResponse,
  ValidationErrorResponse,
  ConflictResponse,
  BadRequestTokenError,
} from "../common/responses";
import {
  LoginRequest,
  AuthSuccessResponse,
  RegisterRequest,
  RefreshRequest,
  TokenPairSchema,
  UserSchema,
  LogoutRequest,
  EmailVerificationRequest,
  ForgotPasswordRequest,
  ResetPasswordRequest
} from './auth.schemas';
import { HttpStatus } from 'src/common/http-status';

const c = initContract();

export const authContract = c.router({
  login: {
    method: 'POST',
    path: '/auth/login',
    summary: 'Login to the application',
    body: LoginRequest,
    responses: {
      [HttpStatus.OK]: AuthSuccessResponse,
      [HttpStatus.UNAUTHORIZED]: UnauthorizedResponse,
      [HttpStatus.UNPROCESSABLE_ENTITY]: ValidationErrorResponse,
    },
  },
  register: {
    method: 'POST',
    path: '/auth/register',
    summary: 'Register a new user',
    body: RegisterRequest,
    responses: {
      [HttpStatus.CREATED]: AuthSuccessResponse,
      [HttpStatus.CONFLICT]: ConflictResponse,
      [HttpStatus.UNPROCESSABLE_ENTITY]: ValidationErrorResponse,
    },
  },
  refresh: {
    method: 'POST',
    path: '/auth/refresh',
    summary: 'Refresh access token',
    body: RefreshRequest,
    responses: {
      [HttpStatus.OK]: TokenPairSchema,
      [HttpStatus.UNAUTHORIZED]: UnauthorizedResponse,
    },
  },
  me: {
    method: 'GET',
    path: '/auth/me',
    summary: 'Get current user info',
    responses: {
      [HttpStatus.OK]: UserSchema,
      [HttpStatus.UNAUTHORIZED]: UnauthorizedResponse,
    },
  },
  logout: {
    method: 'POST',
    path: '/auth/logout',
    summary: 'Logout user',
    body: LogoutRequest,
    responses: {
      [HttpStatus.NO_CONTENT]: z.null(),
      [HttpStatus.UNAUTHORIZED]: UnauthorizedResponse,
    },
  },
  verifyEmail: {
    method: 'POST',
    path: '/auth/verify-email',
    summary: 'Verify email with token',
    body: EmailVerificationRequest,
    responses: {
      [HttpStatus.NO_CONTENT]: z.null(),
      [HttpStatus.BAD_REQUEST]: BadRequestTokenError,
    },
  },
  forgotPassword: {
    method: 'POST',
    path: '/auth/forgot-password',
    summary: 'Send password reset email',
    body: ForgotPasswordRequest,
    responses: {
      [HttpStatus.NO_CONTENT]: z.null(),
    },
  },
  resetPassword: {
    method: 'POST',
    path: '/auth/reset-password',
    summary: 'Reset password with token',
    body: ResetPasswordRequest,
    responses: {
      [HttpStatus.NO_CONTENT]: z.null(),
      [HttpStatus.BAD_REQUEST]: BadRequestTokenError,
      [HttpStatus.UNPROCESSABLE_ENTITY]: ValidationErrorResponse,
    },
  },
});
