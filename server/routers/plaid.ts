import { createPlaidLinkToken, getAuth } from "../services/plaidService";

import { procedure, router } from "server/trpc";
import { z } from "zod";

const plaidRouter = router({
  createLinkToken: procedure.input(z.void()).query(async () => {
    return await createPlaidLinkToken();
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
