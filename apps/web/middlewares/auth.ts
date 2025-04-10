import { authApi } from "@/lib/api";
import {
  COOKIE_KEY_ACCESS_TOKEN,
  COOKIE_KEY_REFRESH_TOKEN,
} from "@/lib/constants";
import { getExpirationDate, isJwtExpired } from "@/lib/utils";
import { HttpStatus } from "@workspace/contracts";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { Logger } from "@/lib/logger";

const logger = new Logger("Middleware").child({ scope: "auth" });

export async function handleAuth() {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get(COOKIE_KEY_ACCESS_TOKEN)?.value;
  const refreshToken = cookieStore.get(COOKIE_KEY_REFRESH_TOKEN)?.value;

  const accessValid = accessToken && !isJwtExpired(accessToken);
  const refreshValid = refreshToken && !isJwtExpired(refreshToken);

  logger.debug("Token check", {
    accessPresent: !!accessToken,
    accessValid,
    refreshPresent: !!refreshToken,
    refreshValid,
  });

  if (accessValid) {
    logger.debug("Using valid access token");
    return NextResponse.next();
  }

  if (refreshValid) {
    logger.info("Attempting token refresh");
    try {
      const response = await authApi.refresh({ body: { refreshToken } });

      if (response.status !== HttpStatus.OK) {
        logger.warn("Token refresh failed", { status: response.status });
        return NextResponse.json(
          { message: "Failed to refresh token" },
          { status: response.status },
        );
      }

      const { accessToken: newAccess, refreshToken: newRefresh } =
        response.body;
      const nextResponse = NextResponse.next();

      nextResponse.cookies.set(COOKIE_KEY_ACCESS_TOKEN, newAccess, {
        expires: getExpirationDate(newAccess),
        sameSite: "none",
        secure: true,
        httpOnly: false,
        path: "/",
      });
      nextResponse.cookies.set(COOKIE_KEY_REFRESH_TOKEN, newRefresh, {
        expires: getExpirationDate(newRefresh),
        sameSite: "none",
        secure: true,
        httpOnly: false,
        path: "/",
      });

      logger.info("Token refresh successful, new tokens set");
      return nextResponse;
    } catch (err) {
      logger.error("Token refresh threw error, continuing unauthenticated", {
        error: err,
      });
    }
  }

  logger.warn("No valid tokens, continuing unauthenticated");
  return NextResponse.next();
}
