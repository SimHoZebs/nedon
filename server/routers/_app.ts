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
  Transaction,
  RemovedTransaction,
} from "plaid";
import { accountRouter } from "./account";
import db from "../../lib/util/db";
import { User } from "@prisma/client";

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

const setAccessToken = async ({
  publicToken,
  id,
}: {
  publicToken: string;
  id: string;
}) => {
  const tokenResponse = await client.itemPublicTokenExchange({
    public_token: publicToken,
  });

  const userUpdateData: Partial<User> = {
    PUBLIC_TOKEN: publicToken,
    ACCESS_TOKEN: tokenResponse.data.access_token,
    ITEM_ID: tokenResponse.data.item_id,
    TRANSFER_ID: null,
  };

  if (PLAID_PRODUCTS.includes(Products.Transfer)) {
    userUpdateData.TRANSFER_ID = await authorizeAndCreateTransfer(
      tokenResponse.data.item_id
    );
  }

  const user = await db.user.update({
    where: {
      id,
    },
    data: { ...userUpdateData },
  });

  return {
    // the 'access_token' is a private token, DO NOT pass this token to the frontend in your production environment
    access_token: user.ACCESS_TOKEN,
    item_id: user.ITEM_ID,
    error: null,
  };
};

export const appRouter = router({
  account: accountRouter,

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

  info: procedure.input(z.string()).query(async ({ input }) => {
    const user = await db.user.findFirst({
      where: {
        id: input,
      },
    });

    if (!user) return null;

    const { id, ...rest } = user;

    return {
      products: PLAID_PRODUCTS,
      ...rest,
    };
  }),

  sandBoxAccess: procedure
    .input(z.object({ instituteID: z.string(), id: z.string() }))
    .query(async ({ input }) => {
      const response = await client.sandboxPublicTokenCreate({
        institution_id: input.instituteID, //"ins_56"
        initial_products: PLAID_PRODUCTS,
      });

      const setAccessTokenResponse = await setAccessToken({
        id: input.id,
        publicToken: response.data.public_token,
      });

      return setAccessTokenResponse.access_token;
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
      })
    )
    .mutation(async ({ input }) => {
      return await setAccessToken(input);
    }),

  // Retrieve ACH or ETF Auth data for an Item's accounts
  // https://plaid.com/docs/#auth
  auth: procedure.input(z.string()).mutation(async ({ input }) => {
    const user = await db.user.findFirst({
      where: {
        id: input,
      },
    });

    if (!user || !user.ACCESS_TOKEN) return null;

    const authResponse = await client.authGet({
      access_token: user.ACCESS_TOKEN,
    });

    return authResponse.data;
  }),

  // Retrieve Transactions for an Item
  // https://plaid.com/docs/#transactions
  transactions: procedure.input(z.void()).mutation(async ({ input }) => {
    // Set cursor to empty to receive all historical updates
    let cursor = null;

    // New transaction updates since "cursor"
    let added: Transaction[] = [];
    let modified: Transaction[] = [];
    // Removed transaction ids
    let removed: RemovedTransaction[] = [];
    let hasMore = true;
    // Iterate through each page of new transaction updates for item
    while (hasMore) {
      const request = {
        access_token: ACCESS_TOKEN,
        cursor: cursor,
      };
      const response = await client.transactionsSync(request);
      const data = response.data;
      // Add this page of results
      added = added.concat(data.added);
      modified = modified.concat(data.modified);
      removed = removed.concat(data.removed);
      hasMore = data.has_more;
      // Update cursor to the next cursor
      cursor = data.next_cursor;
    }

    const compareTxnsByDateAscending = (a, b) =>
      (a.date > b.date) - (a.date < b.date);
    // Return the 8 most recent transactions
    const recently_added = [...added]
      .sort(compareTxnsByDateAscending)
      .slice(-8);
    return { latest_transactions: recently_added };
  }),

  // Retrieve Investment Transactions for an Item
  // https://plaid.com/docs/#investments
  investments_transactions: procedure
    .input(z.void())
    .mutation(async ({ input }) => {
      const startDate = moment().subtract(30, "days").format("YYYY-MM-DD");
      const endDate = moment().format("YYYY-MM-DD");
      const configs = {
        access_token: ACCESS_TOKEN,
        start_date: startDate,
        end_date: endDate,
      };
      const investmentTransactionsResponse =
        await client.investmentsTransactionsGet(configs);

      return {
        error: null,
        investments_transactions: investmentTransactionsResponse.data,
      };
    }),

  // Retrieve Identity for an Item
  // https://plaid.com/docs/#identity
  identity: procedure.input(z.void()).mutation(async ({ input }) => {
    const identityResponse = await client.identityGet({
      access_token: ACCESS_TOKEN,
    });

    return { identity: identityResponse.data.accounts };
  }),

  // Retrieve real-time Balances for each of an Item's accounts
  // https://plaid.com/docs/#balance
  balance: procedure.input(z.void()).mutation(async ({ input }) => {
    const balanceResponse = await client.accountsBalanceGet({
      access_token: ACCESS_TOKEN,
    });

    return balanceResponse.data;
  }),

  // Retrieve Holdings for an Item
  // https://plaid.com/docs/#investments
  holdings: procedure.input(z.void()).mutation(async ({ input }) => {
    const holdingsResponse = await client.investmentsHoldingsGet({
      access_token: ACCESS_TOKEN,
    });

    return { error: null, holdings: holdingsResponse.data };
  }),

  // Retrieve Liabilities for an Item
  // https://plaid.com/docs/#liabilities
  liabilities: procedure.input(z.void()).mutation(async ({ input }) => {
    const liabilitiesResponse = await client.liabilitiesGet({
      access_token: ACCESS_TOKEN,
    });

    return { error: null, liabilities: liabilitiesResponse.data };
  }),

  // Retrieve information about an Item
  // https://plaid.com/docs/#retrieve-item
  item: procedure.input(z.void()).mutation(async ({ input }) => {
    // Pull the Item - this includes information about available products,
    // billed products, webhook information, and more.
    const itemResponse = await client.itemGet({
      access_token: ACCESS_TOKEN,
    });
    // Also pull information about the institution
    const configs = {
      institution_id: itemResponse.data.item.institution_id,
      country_codes: PLAID_COUNTRY_CODES,
    };
    const instResponse = await client.institutionsGetById(configs);

    return {
      item: itemResponse.data.item,
      institution: instResponse.data.institution,
    };
  }),

  // Retrieve an Item's accounts
  // https://plaid.com/docs/#accounts
  accounts: procedure.input(z.void()).mutation(async ({ input }) => {
    const accountsResponse = await client.accountsGet({
      access_token: ACCESS_TOKEN,
    });

    return accountsResponse.data;
  }),

  // Create and then retrieve an Asset Report for one or more Items. Note that an
  // Asset Report can contain up to 100 items, but for simplicity we're only
  // including one Item here.
  // https://plaid.com/docs/#assets
  assets: procedure.input(z.void()).mutation(async ({ input }) => {
    // You can specify up to two years of transaction history for an Asset
    // Report.
    const daysRequested = 10;

    // The `options` object allows you to specify a webhook for Asset Report
    // generation, as well as information that you want included in the Asset
    // Report. All fields are optional.
    const options = {
      client_report_id: "Custom Report ID #123",
      // webhook: 'https://your-domain.tld/plaid-webhook',
      user: {
        client_user_id: "Custom User ID #456",
        first_name: "Alice",
        middle_name: "Bobcat",
        last_name: "Cranberry",
        ssn: "123-45-6789",
        phone_number: "555-123-4567",
        email: "alice@example.com",
      },
    };
    const configs = {
      access_tokens: [ACCESS_TOKEN],
      days_requested: daysRequested,
      options,
    };
    const assetReportCreateResponse = await client.assetReportCreate(configs);

    const assetReportToken = assetReportCreateResponse.data.asset_report_token;

    const getResponse = await getAssetReportWithRetries(
      client,
      assetReportToken
    );
    const pdfRequest = {
      asset_report_token: assetReportToken,
    };

    const pdfResponse = await client.assetReportPdfGet(pdfRequest, {
      responseType: "arraybuffer",
    });
    return {
      json: getResponse.data.report,
      pdf: pdfResponse.data.toString("base64"),
    };
  }),

  transfer: procedure.input(z.void()).mutation(async ({ input }) => {
    const transferGetResponse = await client.transferGet({
      transfer_id: TRANSFER_ID,
    });

    return {
      error: null,
      transfer: transferGetResponse.data.transfer,
    };
  }),

  // This functionality is only relevant for the UK/EU Payment Initiation product.
  // Retrieve Payment for a specified Payment ID
  payment: procedure.input(z.void()).query(async () => {
    const paymentGetResponse = await client.paymentInitiationPaymentGet({
      payment_id: PAYMENT_ID,
    });

    return { error: null, payment: paymentGetResponse.data };
  }),

  //TO-DO: This endpoint will be deprecated in the near future
  incomeVerificationPaystubs: procedure
    .input(z.void())
    .mutation(async ({ input }) => {
      const paystubsGetResponse = await client.incomeVerificationPaystubsGet({
        access_token: ACCESS_TOKEN,
      });

      return { error: null, paystubs: paystubsGetResponse.data };
    }),
});

// export type definition of API
export type AppRouter = typeof appRouter;

// This is a helper function to poll for the completion of an Asset Report and
// then send it in the response to the client. Alternatively, you can provide a
// webhook in the `options` object in your `/asset_report/create` request to be
// notified when the Asset Report is finished being generated.

const getAssetReportWithRetries = (
  plaidClient: PlaidApi,
  asset_report_token: string,
  ms = 1000,
  retriesLeft = 20
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
            retriesLeft - 1
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
