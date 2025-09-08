import db from "@/util/db";

import { PLAID_COUNTRY_CODES, PLAID_PRODUCTS } from "../constants";
import { procedure } from "../trpc";
import { client } from "../util/plaid";

import type { User } from "@prisma/client";
import { ACHClass, Products, TransferNetwork, TransferType } from "plaid";
import { router } from "server/trpc";
import z from "zod";
import { exact } from "@/types/types";
import { UserClientSide } from "@/types/user";

const plaidRouter = router({
  sandBoxAccess: procedure
    .input(z.object({ instituteID: z.string().nullish() }))
    .query(async () => {
      const response = await client.sandboxPublicTokenCreate({
        // institution_id: input.instituteID,
        institution_id: "ins_1",
        initial_products: PLAID_PRODUCTS,
      });

      return response.data.public_token;
    }),

  createLinkToken: procedure.input(z.void()).query(async () => {
    const response = await client.linkTokenCreate({
      user: {
        client_user_id: "user-id",
      },
      client_name: "Plaid Quickstart",
      products: PLAID_PRODUCTS,
      country_codes: PLAID_COUNTRY_CODES,
      language: "en",
    });
    return response.data.link_token;
  }),

  setAccessToken: procedure
    .input(
      z.object({
        publicToken: z.string(),
        id: z.string(),
      }),
    )
    .mutation(async ({ input }) => {
      return await setAccessToken(input);
    }),

  // Retrieve ACH or ETF Auth data for an Item's accounts
  // https://plaid.com/docs/#auth
  auth: procedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input }) => {
      const user = await db.user.findFirst({
        where: {
          id: input.id,
        },
        select: { accessToken: true },
      });

      if (!user || !user.accessToken) return null;

      const authResponse = await client.authGet({
        access_token: user.accessToken,
      });

      return authResponse.data;
    }),
});

export default plaidRouter;

const setAccessToken = async ({
  publicToken,
  id,
}: {
  publicToken: string;
  id: string;
}) => {
  const exchangeResponse = await client.itemPublicTokenExchange({
    public_token: publicToken,
  });

  const userUpdateData: Partial<User> = {
    publicToken: publicToken,
    accessToken: exchangeResponse.data.access_token,
    itemId: exchangeResponse.data.item_id,
    transferId: null,
  };

  if (PLAID_PRODUCTS.includes(Products.Transfer)) {
    userUpdateData.transferId = await authorizeAndCreateTransfer(
      exchangeResponse.data.item_id,
    );
  }

  const user = await db.user.update({
    where: {
      id,
    },
    include: {
      myConnectionArray: true,
    },
    data: userUpdateData,
  });

  const { accessToken, ...userWithoutAccessToken } = user;

  return exact<UserClientSide>()({
    ...userWithoutAccessToken,
    hasAccessToken: !!accessToken,
  });
};

const authorizeAndCreateTransfer = async (accessToken: string) => {
  // We call /accounts/get to obtain first account_id - in production,
  // account_id's should be persisted in a data store and retrieved
  // from there.
  const accountsGetResponse = await client.accountsGet({
    access_token: accessToken,
  });

  // const user = await db.user.findFirst({
  //   where: {
  //     ITEM_ID: userItemId,
  //   },
  // });

  // if (!user) throw new Error("User not found");

  // const accountId = user.ITEM_ID as string; //temporary error suppression

  const accountId = accountsGetResponse.data.accounts[0].account_id;

  const transferAuthorizationResponse =
    await client.transferAuthorizationCreate({
      access_token: accessToken,
      account_id: accountId,
      type: TransferType.Credit,
      network: TransferNetwork.Ach,
      amount: "1.34",
      ach_class: ACHClass.Ppd,
      user: {
        legal_name: "FirstName LastName",
        email_address: "foobar@email.com",
        address: {
          street: "123 Main St.",
          city: "San Francisco",
          region: "CA",
          postal_code: "94053",
          country: "US",
        },
      },
    });

  const authorizationId = transferAuthorizationResponse.data.authorization.id;

  const transferResponse = await client.transferCreate({
    idempotency_key: "1223abc456xyz7890001",
    access_token: accessToken,
    account_id: accountId,
    authorization_id: authorizationId,
    type: TransferType.Credit,
    network: TransferNetwork.Ach,
    amount: "12.34",
    description: "Payment",
    ach_class: ACHClass.Ppd,
    user: {
      legal_name: "FirstName LastName",
      email_address: "foobar@email.com",
      address: {
        street: "123 Main St.",
        city: "San Francisco",
        region: "CA",
        postal_code: "94053",
        country: "US",
      },
    },
  });

  return transferResponse.data.transfer.id;
};
