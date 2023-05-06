import { User, Group } from "@prisma/client";
import { z } from "zod";

export interface UserClientSide extends Omit<User, "ACCESS_TOKEN"> {
  hasAccessToken: boolean;
  groupArray: Group[];
}

export const user = z.object({
  id: z.string(),
  ACCESS_TOKEN: z.string().or(z.undefined()),
  PUBLIC_TOKEN: z.string().or(z.undefined()),
  ITEM_ID: z.string().or(z.undefined()),
  TRANSFER_ID: z.string().or(z.undefined()),
  PAYMENT_ID: z.string().or(z.undefined()),
});

export const groupArray = z.array(
  z.object({
    id: z.string(),
  })
);
