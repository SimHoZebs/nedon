import { createPlaidLinkToken } from "../services/plaid";

import { procedure, router } from "server/trpc";
import { z } from "zod";

const plaidRouter = router({
  createLinkToken: procedure.input(z.void()).query(async () => {
    return await createPlaidLinkToken();
  }),
});

export default plaidRouter;
