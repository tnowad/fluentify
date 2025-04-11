import { authApi } from "@/lib/api";
import {
  COOKIE_KEY_ACCESS_TOKEN,
  COOKIE_KEY_REFRESH_TOKEN,
} from "@/lib/constants";
import { getExpirationDate, isJwtExpired } from "@/lib/utils";
import { HttpStatus } from "@workspace/contracts";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function handleAuth() {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get(COOKIE_KEY_ACCESS_TOKEN)?.value;
  const refreshToken = cookieStore.get(COOKIE_KEY_REFRESH_TOKEN)?.value;

  if (accessToken) {
    console.log(
      "[Middleware] Access Token:",
      isJwtExpired(accessToken) ? "Expired" : "Valid",
    );
  } else {
    console.log("[Middleware] Access Token: Not Present");
  }

  if (refreshToken) {
    console.log(
      "[Middleware] Refresh Token:",
      isJwtExpired(refreshToken) ? "Expired" : "Valid",
    );
  } else {
    console.log("[Middleware] Refresh Token: Not Present");
  }

  if (accessToken && !isJwtExpired(accessToken)) {
    console.log("[Middleware] Access token is valid");
    return NextResponse.next();
  }

  if (refreshToken && !isJwtExpired(refreshToken)) {
    console.log(
      "[Middleware] Access token expired, attempting refresh with valid refresh token",
    );
    try {
      const response = await authApi.refresh({ body: { refreshToken } });

      if (response.status !== HttpStatus.OK) {
        console.warn(
          "[Middleware] Token refresh failed with status:",
          response.status,
        );
        return NextResponse.json(
          { message: "Failed to refresh token" },
          { status: response.status },
        );
      }

      const { accessToken: newAccessToken, refreshToken: newRefreshToken } =
        response.body;
      console.log("[Middleware] Tokens successfully refreshed");

      const nextResponse = NextResponse.next();
      nextResponse.cookies.set(COOKIE_KEY_ACCESS_TOKEN, newAccessToken, {
        expires: getExpirationDate(newAccessToken),
        sameSite: "none",
        secure: true,
        httpOnly: false,
        path: "/",
      });
      nextResponse.cookies.set(COOKIE_KEY_REFRESH_TOKEN, newRefreshToken, {
        expires: getExpirationDate(newRefreshToken),
        sameSite: "none",
        secure: true,
        httpOnly: false,
        path: "/",
      });

      return nextResponse;
    } catch (err) {
      console.error("[Middleware] Error during token refresh:", err);
      return NextResponse.json(
        { message: "Token refresh failed" },
        { status: HttpStatus.INTERNAL_SERVER_ERROR },
      );
    }
  }

  console.log(
    "[Middleware] No valid access or refresh token found, proceeding without refreshing",
  );
  return NextResponse.next();
}
