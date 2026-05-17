import { procedure, router } from "server/trpc";
import { z } from "zod";

const bankRouter = router({
  createLinkToken: procedure.input(z.void()).query(async ({ ctx }) => {
    return await ctx.bankService.createLinkToken();
  }),
});

export default bankRouter;
