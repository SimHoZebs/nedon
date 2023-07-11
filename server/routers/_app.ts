import { z } from "zod";
import { procedure, router } from "../trpc";
import {
  PlaidApi,
  Products,
  TransferType,
  TransferNetwork,
  ACHClass,
} from "plaid";
import userRouter from "./user";
import db from "../../lib/util/db";
import { User } from "@prisma/client";
import { groupRouter } from "./group";
import transactionRouter from "./transaction";
import { PLAID_COUNTRY_CODES, PLAID_PRODUCTS, client } from "../util";
import stripUserSecrets from "../../lib/util/stripUserSecrets";
import { convertPlaidCategoriesToCategoryArray } from "../../lib/util/transaction";

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
    PUBLIC_TOKEN: publicToken,
    ACCESS_TOKEN: exchangeResponse.data.access_token,
    ITEM_ID: exchangeResponse.data.item_id,
    TRANSFER_ID: null,
  };

  if (PLAID_PRODUCTS.includes(Products.Transfer)) {
    userUpdateData.TRANSFER_ID = await authorizeAndCreateTransfer(
      exchangeResponse.data.item_id,
    );
  }

  const user = await db.user.update({
    where: {
      id,
    },
    include: {
      groupArray: true,
    },
    data: { ...userUpdateData },
  });

  return stripUserSecrets(user);
};

export const appRouter = router({
  user: userRouter,
  group: groupRouter,
  transaction: transactionRouter,

  sandBoxAccess: procedure
    .input(z.object({ instituteID: z.string().nullish() }))
    .query(async ({ input }) => {
      const response = await client.sandboxPublicTokenCreate({
        // institution_id: input.instituteID,
        institution_id: "ins_56",
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
      return setAccessToken(input);
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
      });

      if (!user || !user.ACCESS_TOKEN) return null;

      const authResponse = await client.authGet({
        access_token: user.ACCESS_TOKEN,
      });

      return authResponse.data;
    }),

  getCategoryOptionArray: procedure.input(z.undefined()).query(async () => {
    const response = await client.categoriesGet({});
    return convertPlaidCategoriesToCategoryArray(response.data.categories);
  }),
});

export type AppRouter = typeof appRouter;
// This is a helper function to poll for the completion of an Asset Report and
// then send it in the response to the client. Alternatively, you can provide a
// webhook in the `options` object in your `/asset_report/create` request to be
// notified when the Asset Report is finished being generated.

const getAssetReportWithRetries = (
  plaidClient: PlaidApi,
  asset_report_token: string,
  ms = 1000,
  retriesLeft = 20,
) =>
  new Promise((resolve, reject) => {
    const request = {
      asset_report_token,
    };

    plaidClient
      .assetReportGet(request)
      .then(resolve)
      .catch(() => {
        setTimeout(() => {
          if (retriesLeft === 1) {
            reject("Ran out of retries while polling for asset report");
            return;
          }
          getAssetReportWithRetries(
            plaidClient,
            asset_report_token,
            ms,
            retriesLeft - 1,
          ).then(resolve);
        }, ms);
      });
  });

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
