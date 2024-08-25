import { z } from "zod";
import { procedure, router } from "../trpc";
import { type Receipt, ReceiptInputSchema } from "@/util/types";
import db from "@/util/db";
import { imgAnnotator } from "server/gcloudClient";
import openai from "server/openaiClient";

const receiptRouter = router({
  create: procedure
    .input(
      z.object({
        id: z.string(),
        receipt: ReceiptInputSchema,
      }),
    )
    .mutation(async ({ input }) => {
      const { items, txId, ...receiptWithoutItems } = input.receipt;

      const updatedTx = await db.tx.update({
        where: {
          id: input.id,
        },
        data: {
          receipt: {
            create: {
              ...receiptWithoutItems,
              items: {
                createMany: { data: items },
              },
            },
          },
        },
        include: {
          receipt: {
            include: {
              items: true,
            },
          },
        },
      });

      return updatedTx.receipt;
    }),

  process: procedure
    .input(z.object({ signedUrl: z.string() }))
    .mutation(async ({ input }) => {
      const [result] = await imgAnnotator.textDetection(input.signedUrl);

      const textAnnotationArray = result.textAnnotations;
      if (!textAnnotationArray) return null;

      const thread = await openai.beta.threads.create();

      await openai.beta.threads.messages.create(thread.id, {
        role: "user",
        content: textAnnotationArray[0].description || "",
      });

      const run = await openai.beta.threads.runs.createAndPoll(thread.id, {
        assistant_id: "asst_ThX4O8JDzBsGV7BO43RA3FVE",
      });

      if (run.status !== "completed") {
        console.error("Run failed", run);
        return null;
      }

      const message = (await openai.beta.threads.messages.list(run.thread_id))
        .data[0];

      if (message.content[0].type !== "text") return null;
      try {
        return JSON.parse(message.content[0].text.value) as Receipt;
      } catch (e) {
        console.error("JSON.parse failed", e);
        return null;
      }
    }),
});

export default receiptRouter;
