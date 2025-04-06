import { NextResponse } from "next/server";
import { handleAuth } from "./middlewares/auth";

export async function middleware() {
  const response = await handleAuth();
  if (response) {
    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)",
  ],
};
