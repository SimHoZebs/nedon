import { exact } from "@/util/type";

import { type UserClientSide, UserClientSideSchema } from "@/types/user";

import {
  createPlaidLinkToken,
  getAuth,
  getSandboxPublicToken,
  setPlaidAccessToken,
} from "../services/plaidService";

import { procedure, router } from "server/trpc";
import { z } from "zod";

const plaidRouter = router({
  createSandboxPublicToken: procedure
    .input(z.object({ instituteID: z.string() }))
    .query(async ({ input }) => {
      return await getSandboxPublicToken(input.instituteID);
    }),

  createLinkToken: procedure.input(z.void()).query(async () => {
    return await createPlaidLinkToken();
  }),

  setAccessToken: procedure
    .input(
      z.object({
        publicToken: z.string(),
        id: z.string(),
      }),
    )
    .output(UserClientSideSchema)
    .mutation(async ({ input }) => {
      const user = await setPlaidAccessToken(input);
      const { accessToken, ...userWithoutAccessToken } = user;

      return exact<UserClientSide>()({
        ...userWithoutAccessToken,
        hasAccessToken: !!accessToken,
      });
    }),

  // Retrieve ACH or ETF Auth data for an Item's accounts
  // https://plaid.com/docs/#auth
  auth: procedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input }) => {
      return await getAuth(input.id);
    }),
});

export default plaidRouter;
