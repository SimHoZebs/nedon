import type {
  Connection,
  UnAuthUserClientSide,
  UserClientSide,
} from "@/types/user";

export const OMIT_PRIVATE_DATA = {
  bankAccessToken: true,
  bankSyncToken: true,
} as const;

export const INCLUDE_CONNECTIONS_SAEFLY = {
  include: {
    myConnectionArray: {
      omit: OMIT_PRIVATE_DATA,
    },
  },
} as const;

export const sanitizeUser = (user: {
  id: string;
  name: string;
  myConnectionArray: Connection[];
  bankAccessToken?: string | null;
  bankSyncToken?: string | null;
}): UnAuthUserClientSide | UserClientSide => {
  const sanitizedUser = {
    id: user.id,
    name: user.name,
    myConnectionArray: user.myConnectionArray.map(({ id, name }) => ({
      id,
      name,
    })),
    hasBankSyncToken: !!user.bankSyncToken,
  };

  if (user.bankAccessToken) {
    return {
      ...sanitizedUser,
      hasAccessToken: true,
    } satisfies UserClientSide;
  } else {
    return {
      ...sanitizedUser,
      hasAccessToken: false,
    } satisfies UnAuthUserClientSide;
  }
};
