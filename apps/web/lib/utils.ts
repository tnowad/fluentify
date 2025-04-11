import { jwtDecode } from "jwt-decode";

export function getExpirationDate(token: string): Date {
  const { exp } = jwtDecode<{ exp: number }>(token);
  if (!exp) throw new Error("Token missing 'exp'");
  return new Date(exp * 1000);
}

export const isJwtExpired = (token: string): boolean => {
  const { exp } = jwtDecode<{ exp: number }>(token);
  if (!exp) throw new Error("Token missing 'exp'");
  return Date.now() >= exp * 1000;
};
