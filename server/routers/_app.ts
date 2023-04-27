import { z } from "zod";
import { procedure, router } from "../trpc";
import {
  Configuration,
  PlaidApi,
  Products,
  PlaidEnvironments,
  CountryCode,
  TransferType,
  TransferNetwork,
  ACHClass,
} from "plaid";

const APP_PORT = process.env.APP_PORT || 8000;
const PLAID_CLIENT_ID = process.env.PLAID_CLIENT_ID;
const PLAID_SECRET = process.env.PLAID_SECRET;
const PLAID_ENV = process.env.PLAID_ENV || "sandbox";

// PLAID_PRODUCTS is a comma-separated list of products to use when initializing
// Link. Note that this list must contain 'assets' in order for the app to be
// able to create and retrieve asset reports.
const PLAID_PRODUCTS = (
  process.env.PLAID_PRODUCTS || Products.Transactions
).split(",") as Products[];

// PLAID_COUNTRY_CODES is a comma-separated list of countries for which users
// will be able to select institutions from.
const PLAID_COUNTRY_CODES = (
  process.env.PLAID_COUNTRY_CODES || CountryCode.Us
).split(",") as CountryCode[];

// Parameters used for the OAuth redirect Link flow.
//
// Set PLAID_REDIRECT_URI to 'http://localhost:3000'
// The OAuth redirect flow requires an endpoint on the developer's website
// that the bank website should redirect to. You will need to configure
// this redirect URI for your client ID through the Plaid developer dashboard
// at https://dashboard.plaid.com/team/api.
const PLAID_REDIRECT_URI = process.env.PLAID_REDIRECT_URI || "";

// Parameter used for OAuth in Android. This should be the package name of your app,
// e.g. com.plaid.linksample
const PLAID_ANDROID_PACKAGE_NAME = process.env.PLAID_ANDROID_PACKAGE_NAME || "";

// We store the access_token in memory - in production, store it in a secure
// persistent data store
let ACCESS_TOKEN = null;
let PUBLIC_TOKEN = null;
let ITEM_ID = null;

// The payment_id is only relevant for the UK/EU Payment Initiation product.
// We store the payment_id in memory - in production, store it in a secure
// persistent data store along with the Payment metadata, such as userId .
let PAYMENT_ID = null;
// The transfer_id is only relevant for Transfer ACH product.
// We store the transfer_id in memory - in production, store it in a secure
// persistent data store
let TRANSFER_ID = null;

// Initialize the Plaid client
// Find your API keys in the Dashboard (https://dashboard.plaid.com/account/keys)

const configuration = new Configuration({
  basePath: PlaidEnvironments[PLAID_ENV],
  baseOptions: {
    headers: {
      "PLAID-CLIENT-ID": PLAID_CLIENT_ID,
      "PLAID-SECRET": PLAID_SECRET,
      "Plaid-Version": "2020-09-14",
    },
  },
});

const client = new PlaidApi(configuration);

export const appRouter = router({
  hello: procedure
    .input(
      z.object({
        text: z.string(),
      })
    )
    .query(({ input }) => {
      return {
        greeting: `hello ${input.text}`,
      };
    }),

  info: procedure.input(z.void()).query(() => {
    return {
      item_id: ITEM_ID,
      access_token: ACCESS_TOKEN,
      products: PLAID_PRODUCTS,
    };
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

  setAccessToken: procedure.input(z.string()).mutation(async ({ input }) => {
    const authorizeAndCreateTransfer = async (accessToken) => {
      // We call /accounts/get to obtain first account_id - in production,
      // account_id's should be persisted in a data store and retrieved
      // from there.
      const accountsResponse = await client.accountsGet({
        access_token: accessToken,
      });
      const accountId = accountsResponse.data.accounts[0].account_id;

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
      const authorizationId =
        transferAuthorizationResponse.data.authorization.id;

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

    const tokenResponse = await client.itemPublicTokenExchange({
      public_token: PUBLIC_TOKEN,
    });

    ACCESS_TOKEN = tokenResponse.data.access_token;
    ITEM_ID = tokenResponse.data.item_id;
    if (PLAID_PRODUCTS.includes(Products.Transfer)) {
      TRANSFER_ID = await authorizeAndCreateTransfer(ACCESS_TOKEN);
    }

    return {
      // the 'access_token' is a private token, DO NOT pass this token to the frontend in your production environment
      access_token: ACCESS_TOKEN,
      item_id: ITEM_ID,
      error: null,
    };
  }),
});

// export type definition of API
export type AppRouter = typeof appRouter;
