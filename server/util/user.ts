import { OMIT_PRIVATE_DATA } from "@/types/user";

export const INCLUDE_CONNECTIONS_SAEFLY = {
  include: {
    myConnectionArray: {
      omit: OMIT_PRIVATE_DATA,
    },
  },
} as const;
