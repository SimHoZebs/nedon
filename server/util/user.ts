import {
  type Connection,
  OMIT_PRIVATE_DATA,
  type PureUser,
  type UnAuthUserClientSide,
  type UserClientSide,
} from "@/types/user";

export const INCLUDE_CONNECTIONS_SAEFLY = {
  include: {
    myConnectionArray: {
      omit: OMIT_PRIVATE_DATA,
    },
  },
} as const;

export const sanitizeUser = (
  user: PureUser & {
    myConnectionArray: Connection[];
    bankAccessToken?: string | null;
    bankSyncToken?: string | null;
  },
): UnAuthUserClientSide | UserClientSide => {
  const { bankAccessToken, bankSyncToken, ...userWithoutAccessToken } = user;

  if (bankAccessToken) {
    return {
      ...userWithoutAccessToken,
      hasAccessToken: true,
      hasBankSyncToken: !!bankSyncToken,
    } as UserClientSide;
  } else {
    return {
      ...userWithoutAccessToken,
      hasAccessToken: false,
      hasBankSyncToken: !!bankSyncToken,
    } as UnAuthUserClientSide;
  }
};
