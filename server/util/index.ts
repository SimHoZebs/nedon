import {
  Configuration,
  CountryCode,
  PlaidApi,
  PlaidEnvironments,
  Products,
} from "plaid";
import type { CatOptionalDefaults } from "prisma/generated/zod";

import type { UnsavedTx } from "@/types/tx";

const APP_PORT = process.env.APP_PORT || 8000;
const PLAID_CLIENT_ID = process.env.PLAID_CLIENT_ID;
const PLAID_SECRET = process.env.PLAID_SECRET;
const PLAID_ENV = process.env.PLAID_ENV || "sandbox";

// PLAID_PRODUCTS is a comma-separated list of products to use when initializing
// Link. Note that this list must contain 'assets' in order for the app to be
// able to create and retrieve asset reports.
export const PLAID_PRODUCTS = (
  process.env.PLAID_PRODUCTS || Products.Transactions
).split(",") as Products[];

// PLAID_COUNTRY_CODES is a comma-separated list of countries for which users
// will be able to select institutions from.
export const PLAID_COUNTRY_CODES = (
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

export const client = new PlaidApi(configuration);

export const createCatInput = (cat: CatOptionalDefaults) => {
  return { name: cat.name, nameArray: cat.nameArray, amount: cat.amount };
};

export const txInclude = {
  catArray: true,
  splitArray: true,
  receipt: {
    include: {
      items: true,
    },
  },
};

export const createTxInDBInput = (txClientSide: UnsavedTx) => {
  return {
    data: {
      ...txClientSide,
      originTxId: txClientSide.originTxId || undefined,
      plaidTx: txClientSide.plaidTx || undefined,
      receipt: txClientSide.receipt
        ? {
            create: {
              ...txClientSide.receipt,
              items: {
                createMany: { data: txClientSide.receipt.items },
              },
            },
          }
        : undefined,
      splitArray: {
        create: txClientSide.splitArray.map(({ originTxId, ...split }) => ({
          ...split,
        })),
      },
      catArray: {
        create: txClientSide.catArray.map(({ txId, ...cat }) => ({
          ...cat,
        })),
      },
    },
    include: txInclude,
  };
};
