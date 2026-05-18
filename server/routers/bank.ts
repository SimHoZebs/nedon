import { procedure, router } from "server/trpc";
import { z } from "zod";

const bankRouter = router({
  createConnectionIntent: procedure
    .input(z.object({ userId: z.string() }))
    .query(async ({ input, ctx }) => {
      return await ctx.bankService.createConnectionIntent(input.userId);
    }),
});

export default bankRouter;
