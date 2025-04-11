import { initClient, tsRestFetchApi } from "@ts-rest/core";
import { apiContracts, authContract, HttpStatus } from "@workspace/contracts";
import { getCookie, setCookie } from "cookies-next";
import { jwtDecode } from "jwt-decode";
import { COOKIE_KEY_ACCESS_TOKEN, COOKIE_KEY_REFRESH_TOKEN } from "./constants";
import { isServer } from "@tanstack/react-query";
import { isJwtExpired } from "./utils";

const apiConfig = {
  baseUrl: "http://127.0.0.1:3200",
  baseHeaders: {
    "Content-Type": "application/json",
  },
};

export const authApi = initClient(authContract, apiConfig);

const getAccessToken = async (): Promise<string | null> => {
  const cookies = isServer ? (await import("next/headers")).cookies : undefined;

  const accessToken = await getCookie(COOKIE_KEY_ACCESS_TOKEN, { cookies });
  const refreshToken = await getCookie(COOKIE_KEY_REFRESH_TOKEN, { cookies });

  const accessValid = accessToken && !isJwtExpired(accessToken);
  const refreshValid = refreshToken && !isJwtExpired(refreshToken);

  if (isServer) {
    return accessValid ? accessToken : null;
  }

  if (accessValid) return accessToken;
  if (!refreshValid) return null;

  const { status, body } = await authApi.refresh({ body: { refreshToken } });
  if (status !== HttpStatus.OK) return null;

  const { accessToken: newAccess, refreshToken: newRefresh } = body;
  await setCookie(COOKIE_KEY_ACCESS_TOKEN, newAccess, { cookies });
  await setCookie(COOKIE_KEY_REFRESH_TOKEN, newRefresh, { cookies });

  return newAccess;
};

export const api = initClient(apiContracts, {
  ...apiConfig,
  api: async (args) => {
    console.log("[api] Starting API request with args:", args);

    const accessToken = await getAccessToken();
    if (accessToken) {
      console.log("[api] Adding Authorization header with Access Token");
    } else {
      console.warn(
        "[api] No Access Token, proceeding without Authorization header",
      );
    }

    const response = await tsRestFetchApi({
      ...args,
      headers: {
        ...args.headers,
        ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      },
    });

    console.log(
      "[api] API request completed with response status:",
      response.status,
    );
    console.log("[api] Response body:", response.body);

    return response;
  },
});
