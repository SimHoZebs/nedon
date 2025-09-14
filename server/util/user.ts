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
  user: PureUser & { myConnectionArray: Connection[] },
): UnAuthUserClientSide | UserClientSide => {
  const { accessToken, ...userWithoutAccessToken } = user;
  const clientSideUser = {
    ...userWithoutAccessToken,
    hasAccessToken: !!accessToken,
  };
  return clientSideUser;
};
