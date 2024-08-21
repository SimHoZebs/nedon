import { procedure, router } from "server/trpc";
import { imageAnnotatorClient } from "server/gcloudClient";
import { z } from "zod";
import openaiClient from "server/openaiClient";

const aiRouter = router({
  test: procedure.input(z.undefined()).mutation(async () => {
    console.log("running ai test... NEW");

    const [result] = await imageAnnotatorClient.textDetection(
      "public/receipt_mcd.png",
    );
    const textAnnotationArray = result.textAnnotations;
    console.log("checking labels...");
    if (!textAnnotationArray) return;

    console.log(textAnnotationArray[0].description);

    const thread = await openaiClient.beta.threads.create();

    const message = await openaiClient.beta.threads.messages.create(thread.id, {
      role: "user",
      content: textAnnotationArray[0].description || "",
    });

    const run = await openaiClient.beta.threads.runs.createAndPoll(thread.id, {
      assistant_id: "asst_ThX4O8JDzBsGV7BO43RA3FVE",
    });

    if (run.status === "completed") {
      const messages = await openaiClient.beta.threads.messages.list(
        run.thread_id,
      );
      for (const message of messages.data.reverse()) {
        console.log(`${message.role} > ${message.content[0].text.value}`);
      }
      return JSON.parse(messages.data.reverse()[0].content[0].text.value);
    }
    console.log(run.status);
  }),
});

export default aiRouter;
