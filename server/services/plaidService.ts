import db from "@/util/db";

import type { User } from "@prisma/client";
import { ACHClass, Products, TransferNetwork, TransferType } from "plaid";
import { PLAID_COUNTRY_CODES, PLAID_PRODUCTS } from "server/constants";
import { client } from "server/util/plaid";

/**
 * Creates a public token for a sandbox institution.
 * Defaults to "ins_1" if no institution ID is provided.
 */
export const getSandboxPublicToken = async (instituteID: string = "ins_1") => {
  const response = await client.sandboxPublicTokenCreate({
    institution_id: instituteID,
    initial_products: PLAID_PRODUCTS,
  });
  return response.data.public_token;
};

export const createPlaidLinkToken = async () => {
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
};

export const setPlaidAccessToken = async ({
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
      exchangeResponse.data.access_token,
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

  return user;
};

const authorizeAndCreateTransfer = async (accessToken: string) => {
  const accountsGetResponse = await client.accountsGet({
    access_token: accessToken,
  });
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

export const getAuth = async (userId: string) => {
  const user = await db.user.findFirst({
    where: {
      id: userId,
    },
    select: { accessToken: true },
  });

  if (!user || !user.accessToken) return null;

  const authResponse = await client.authGet({
    access_token: user.accessToken,
  });

  return authResponse.data;
};
