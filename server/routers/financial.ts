import {
  FinancialAccountSchema,
  FinancialConnectionSchema,
  FinancialProviderSchema,
} from "@/types/financial";

import { procedure, router } from "../trpc";

import { prismaDecimalToMoney } from "server/mappers/prismaToDto";
import { z } from "zod";

const connectionFlowSchema = z.discriminatedUnion("type", [
  z.object({ type: z.literal("embedded"), token: z.string() }),
  z.object({ type: z.literal("tokenInput"), createUrl: z.url() }),
]);

const completionSchema = z.discriminatedUnion("type", [
  z.object({ type: z.literal("embeddedToken"), token: z.string() }),
  z.object({ type: z.literal("setupToken"), token: z.string() }),
]);

const financialRouter = router({
  beginConnection: procedure
    .input(z.object({ userId: z.string(), provider: FinancialProviderSchema }))
    .output(connectionFlowSchema)
    .query(({ input, ctx }) =>
      ctx.financialDataService.beginConnection(input.provider, input.userId),
    ),

  completeConnection: procedure
    .input(
      z.object({
        userId: z.string(),
        provider: FinancialProviderSchema,
        completion: completionSchema,
      }),
    )
    .output(
      z.object({
        connectionId: z.string(),
        initialSync: z.discriminatedUnion("ok", [
          z.object({ ok: z.literal(true), value: z.void() }),
          z.object({ ok: z.literal(false), error: z.string() }),
        ]),
      }),
    )
    .mutation(({ input, ctx }) =>
      ctx.financialDataService.completeConnection(
        input.userId,
        input.provider,
        input.completion,
      ),
    ),

  listConnections: procedure
    .input(z.object({ userId: z.string() }))
    .output(z.array(FinancialConnectionSchema))
    .query(({ input, ctx }) =>
      ctx.financialDataService.listConnections(input.userId),
    ),

  listAccounts: procedure
    .input(z.object({ userId: z.string() }))
    .output(z.array(FinancialAccountSchema))
    .query(async ({ input, ctx }) => {
      const accounts = await ctx.financialDataService.listAccounts(
        input.userId,
      );
      return accounts.map((account) => ({
        ...account,
        currentBalance: account.currentBalance
          ? prismaDecimalToMoney(account.currentBalance)
          : null,
        availableBalance: account.availableBalance
          ? prismaDecimalToMoney(account.availableBalance)
          : null,
      }));
    }),

  sync: procedure
    .input(z.object({ connectionId: z.string(), startDate: z.date() }))
    .mutation(({ input, ctx }) =>
      ctx.financialDataService.syncConnection(
        input.connectionId,
        input.startDate,
      ),
    ),
});

export default financialRouter;
