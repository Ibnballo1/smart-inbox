// /api/aurinko/callback

import { ExchangeCodeForAccessToken, getAccountDetails } from "@/lib/aurinko";
import { db } from "@/server/db";
import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

export const GET = async (req: NextRequest) => {
  const { userId } = await auth();
  if (!userId)
    return NextResponse.json(
      { message: "User not authenticated" },
      { status: 401 },
    );
  const params = req.nextUrl.searchParams;
  const status = params.get("status");

  if (status !== "success") {
    return NextResponse.json(
      { message: "Failed to link account" },
      { status: 401 },
    );
  }

  // get the code to exchange for the access token
  const code = params.get("code");
  if (!code) {
    return NextResponse.json({ message: "no code provided" }, { status: 400 });
  }

  const token = await ExchangeCodeForAccessToken(code);
  if (!token) {
    return NextResponse.json(
      { message: "Failed to exchange code with access token" },
      { status: 401 },
    );
  }

  const accountDetails = await getAccountDetails(token.accessToken);

  await db.account.upsert({
    where: {
      id: token.accountId.toString(),
    },
    update: {
      accessToken: token.accessToken,
    },
    create: {
      id: token.accountId.toString(),
      userId,
      emailAddress: accountDetails.email,
      name: accountDetails.name,
      accessToken: token.accessToken,
    },
  });
  return NextResponse.redirect(new URL("/mail", req.url));
};
