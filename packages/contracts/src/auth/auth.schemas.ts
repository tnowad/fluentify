import { z } from "zod";

export const UserSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  name: z.string(),
});

export const TokenPairSchema = z.object({
  accessToken: z.string(),
  refreshToken: z.string(),
});

export const LoginRequest = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export const RegisterRequest = LoginRequest.extend({
  name: z.string().min(1),
});

export const RefreshRequest = z.object({
  refreshToken: z.string(),
});

export const LogoutRequest = RefreshRequest;

export const EmailVerificationRequest = z.object({
  token: z.string(),
});

export const ForgotPasswordRequest = z.object({
  email: z.string().email(),
});

export const ResetPasswordRequest = z.object({
  token: z.string(),
  newPassword: z.string().min(6),
});

export const AuthSuccessResponse = TokenPairSchema.extend({
  user: UserSchema,
});
