import { Account } from "@/lib/account";
import { db } from "@/server/db";
import { NextResponse, NextRequest } from "next/server";
import { use } from "react";

export const POST = async (req: NextRequest) => {
  const { accountId, userId } = await req.json();

  if (!accountId || !userId) {
    return NextResponse.json(
      { error: "Missing accountId or userId" },
      { status: 400 },
    );
  }

  // if it (accountId and userId) exist, find the accountId.
  const dbAccount = await db.account.findUnique({
    where: {
      id: accountId,
      userId,
    },
  });

  if (!dbAccount) {
    return NextResponse.json(
      {
        error: "Account not found",
      },
      { status: 404 },
    );
  }

  const account = new Account(dbAccount.accessToken);
  const response = await account.performInitialSync();
  if (!response) {
    return NextResponse.json(
      { error: "Failed to perform initial sync" },
      { status: 500 },
    );
  }

  const { emails, deltaToken } = response;
  // store the delta token in the database for future incremental syncs
  console.log("emails", emails);
  // await db.account.update({
  //   where: {
  //     id: accountId
  //   },
  //   data: {
  //     nextDeltaToken: deltaToken,
  //   },
  // });

  // await syncEmailsToDatabase(emails);
  console.log("sync completed", deltaToken);
  return NextResponse.json({ success: true, deltaToken }, { status: 200 });
};
function performInitialSync(accessToken: string) {
  throw new Error("Function not implemented.");
}
