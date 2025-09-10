import openai from "server/openaiClient";

// This is the assistant ID for the receipt processing assistant.
// It's better to have it here than hardcoded in the middle of logic.
const RECEIPT_ASSISTANT_ID = "asst_ThX4O8JDzBsGV7BO43RA3FVE";

export async function extractReceiptData(text: string): Promise<any> {
  try {
    const thread = await openai.beta.threads.create();

    await openai.beta.threads.messages.create(thread.id, {
      role: "user",
      content: text,
    });

    const run = await openai.beta.threads.runs.createAndPoll(thread.id, {
      assistant_id: RECEIPT_ASSISTANT_ID,
    });

    if (run.status !== "completed") {
      console.error("OpenAI run failed", run);
      throw new Error(`OpenAI run failed with status: ${run.status}`);
    }

    const messages = await openai.beta.threads.messages.list(run.thread_id);
    const message = messages.data[0];

    if (message.content[0].type !== "text") {
      console.error("OpenAI response is not text", message);
      throw new Error("AI response was not in the expected text format.");
    }

    const jsonText = message.content[0].text.value;
    return JSON.parse(jsonText);
  } catch (error) {
    console.error("Error in AI service while extracting receipt data:", error);
    // Re-throw the error to be handled by the caller
    throw error;
  }
}
