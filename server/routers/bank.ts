import { procedure, router } from "server/trpc";
import { z } from "zod";

const bankRouter = router({
  createConnectionIntent: procedure.input(z.void()).query(async ({ ctx }) => {
    return await ctx.bankService.createConnectionIntent();
  }),
});

export default bankRouter;
