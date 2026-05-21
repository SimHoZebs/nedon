import { procedure, router } from "server/trpc";
import { z } from "zod";

const bankRouter = router({
  createConnectionIntent: procedure
    .input(z.object({ userId: z.string() }))
    .query(async ({ input, ctx }) => {
      return await ctx.bankService.createConnectionIntent(input.userId);
    }),
  exchangeConnectionToken: procedure
    .input(z.object({ userId: z.string(), publicToken: z.string() }))
    .mutation(async ({ input, ctx }) => {
      return await ctx.bankService.exchangeConnectionToken(
        input.userId,
        input.publicToken,
      );
    }),
});

export default bankRouter;
