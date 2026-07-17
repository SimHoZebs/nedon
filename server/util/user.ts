import type {
  Connection,
  UnAuthUserClientSide,
  UserClientSide,
} from "@/types/user";

export const INCLUDE_CONNECTIONS_SAEFLY = {
  include: {
    myConnectionArray: {
      select: { id: true, name: true },
    },
    financialConnectionArray: {
      select: {
        status: true,
        lastSyncSuccessAt: true,
      },
    },
  },
} as const;

export const sanitizeUser = (user: {
  id: string;
  name: string;
  myConnectionArray: Connection[];
  financialConnectionArray?: Array<{
    status: "ACTIVE" | "ERROR" | "DISCONNECTED";
    lastSyncSuccessAt: Date | null;
  }>;
}): UnAuthUserClientSide | UserClientSide => {
  const sanitizedUser = {
    id: user.id,
    name: user.name,
    myConnectionArray: user.myConnectionArray.map(({ id, name }) => ({
      id,
      name,
    })),
    hasCompletedFinancialSync:
      user.financialConnectionArray?.some(
        (connection) => connection.lastSyncSuccessAt !== null,
      ) ?? false,
  };

  const hasFinancialConnection =
    user.financialConnectionArray?.some(
      (connection) => connection.status !== "DISCONNECTED",
    ) ?? false;

  if (hasFinancialConnection) {
    return {
      ...sanitizedUser,
      hasFinancialConnection: true,
    } satisfies UserClientSide;
  } else {
    return {
      ...sanitizedUser,
      hasFinancialConnection: false,
    } satisfies UnAuthUserClientSide;
  }
};
