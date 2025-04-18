"use server";

import { auth } from "@clerk/nextjs/server";
import axios from "axios";

// will hold all code to interact with aurinko api

// we need to get an athorization from the user of the Gmail
// meaning the user needs to give permission to aurinko to use his data
export const getAurinkoAuthUrl = async (
  serviceType: "Google" | "Office365",
) => {
  const { userId } = await auth(); // Get the user that is logged in
  if (!userId) throw new Error("User not authenticated");
  const params = new URLSearchParams({
    clientId: process.env.AURINKO_CLIENT_ID as string,
    serviceType,
    scopes: "Mail.ReadWrite Mail.Send Mail.Read Mail.Drafts Mail.All",
    responseType: "code",
    returnUrl: `${process.env.NEXT_PUBLIC_URL}/api/aurinko/callback`, // this is the url that aurinko will redirect to
    // after the user has given permission along with the code
    // to exchange for the access token
  });

  return `https://api.aurinko.io/v1/auth/authorize?${params.toString()}`;
};

export const ExchangeCodeForAccessToken = async (code: string) => {
  try {
    const response = await axios.post(
      `https://api.aurinko.io/v1/auth/token/${code}`,
      {},
      {
        auth: {
          username: process.env.AURINKO_CLIENT_ID as string,
          password: process.env.AURINKO_CLIENT_SECRET as string,
        },
      },
    );
    return response.data as {
      accountId: number;
      accessToken: string;
      userId: string;
      userSession: string;
    };
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error("Error response:", error.response?.data);
    }
    console.error("Error message:", error);
  }
};

export const getAccountDetails = async (accessToken: string) => {
  try {
    const response = await axios.get("https://api.aurinko.io/v1/account", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    return response.data as {
      email: string;
      name: string;
    };
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error("Error fetching account details:", error.response?.data);
    } else {
      console.error("Unexpected account error fetching details:", error);
    }
    throw error;
  }
};
