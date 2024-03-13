import type { Group, User } from "@prisma/client";

import type { GroupClientSide, UserClientSide } from "./types";

export const emptyUser: UserClientSide = {
  id: "",
  name: "",
  hasAccessToken: false,
  PUBLIC_TOKEN: null,
  ITEM_ID: null,
  // The transfer_id is only relevant for Transfer ACH product.
  TRANSFER_ID: null,
  // The payment_id is only relevant for the UK/EU Payment Initiation product.
  PAYMENT_ID: null,
  groupArray: [{ id: "", ownerId: "" }],
};

export function stripUserSecrets({
  ACCESS_TOKEN,
  ...rest
}: User & { groupArray?: Group[] }): UserClientSide {
  return { ...rest, hasAccessToken: ACCESS_TOKEN ? true : false };
}

export const stripUserSecretsFromGroup = (
  group: Group & { userArray: User[] },
): GroupClientSide => {
  const userClientSideArray: UserClientSide[] = group.userArray.map((user) =>
    stripUserSecrets(user),
  );

  const groupClientSide: GroupClientSide = {
    ...group,
    userArray: userClientSideArray,
  };

  return groupClientSide;
};
