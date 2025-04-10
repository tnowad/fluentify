import { initClient, tsRestFetchApi } from "@ts-rest/core";
import { apiContracts, authContract, HttpStatus } from "@workspace/contracts";
import { getCookie, setCookie } from "cookies-next";
import { COOKIE_KEY_ACCESS_TOKEN, COOKIE_KEY_REFRESH_TOKEN } from "./constants";
import { isServer } from "@tanstack/react-query";
import { isJwtExpired } from "./utils";
import { Logger } from "./logger";

const baseLogger = new Logger("HTTPClient");

const apiConfig = {
  baseUrl: "http://127.0.0.1:3200",
  baseHeaders: {
    "Content-Type": "application/json",
  },
};

export const authApi = initClient(authContract, apiConfig);

const getAccessToken = async (): Promise<string | null> => {
  const logger = baseLogger.child({ scope: "auth" });

  const cookies = isServer ? (await import("next/headers")).cookies : undefined;

  const accessToken = await getCookie(COOKIE_KEY_ACCESS_TOKEN, { cookies });
  const refreshToken = await getCookie(COOKIE_KEY_REFRESH_TOKEN, { cookies });

  const accessValid = accessToken && !isJwtExpired(accessToken);
  const refreshValid = refreshToken && !isJwtExpired(refreshToken);

  logger.debug("Access token validity", { accessValid });
  logger.debug("Refresh token validity", { refreshValid });

  if (isServer) {
    return accessValid ? accessToken : null;
  }

  if (accessValid) return accessToken;
  if (!refreshValid) {
    logger.warn("Refresh token expired or missing");
    return null;
  }

  logger.info("Refreshing access token");
  const { status, body } = await authApi.refresh({ body: { refreshToken } });

  if (status !== HttpStatus.OK) {
    logger.error("Token refresh failed", { status });
    return null;
  }

  const { accessToken: newAccess, refreshToken: newRefresh } = body;
  await setCookie(COOKIE_KEY_ACCESS_TOKEN, newAccess, { cookies });
  await setCookie(COOKIE_KEY_REFRESH_TOKEN, newRefresh, { cookies });

  logger.info("Token refresh succeeded");
  return newAccess;
};

export const api = initClient(apiContracts, {
  ...apiConfig,
  api: async (args) => {
    const logger = baseLogger.child({ scope: "http" });

    const accessToken = await getAccessToken();
    if (!accessToken) {
      logger.warn("No access token available, unauthenticated request", {
        url: args.path,
      });
    } else {
      logger.debug("Authenticated request", { url: args.path });
    }

    const response = await tsRestFetchApi({
      ...args,
      headers: {
        ...args.headers,
        ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      },
    });

    logger.debug("Response received", {
      url: args.path,
      status: response.status,
    });

    return response;
  },
});
