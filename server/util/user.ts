import {
  type Connection,
  OMIT_PRIVATE_DATA,
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
  user: any, // Use any here temporarily to ease transition with Prisma type issues
): UnAuthUserClientSide | UserClientSide => {
  const { bankAccessToken, bankSyncToken, ...userWithoutAccessToken } = user;
  const clientSideUser = {
    ...userWithoutAccessToken,
    hasAccessToken: !!bankAccessToken,
  };
  return clientSideUser as any;
};
