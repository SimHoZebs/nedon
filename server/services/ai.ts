import openai from "server/clients/openaiClient";

export async function extractReceiptData(text: string): Promise<unknown> {
  try {
    // TODO(landpatch): set OPENAI_MODEL and OPENAI_INSTRUCTIONS. Stored assistant: asst_ThX4O8JDzBsGV7BO43RA3FVE.
    const model = process.env.OPENAI_MODEL;
    const instructions = process.env.OPENAI_INSTRUCTIONS;
    if (!model || !instructions) {
      throw new Error("Set OPENAI_MODEL and OPENAI_INSTRUCTIONS. Stored assistant: asst_ThX4O8JDzBsGV7BO43RA3FVE.");
    }

    const response = await openai.responses.create({
      model,
      instructions,
      input: text,
    });

    if (response.status !== "completed") {
      console.error("OpenAI run failed", response);
      throw new Error(`OpenAI run failed with status: ${response.status}`);
    }

    if (!response.output_text) {
      console.error("OpenAI response is not text", response);
      throw new Error("AI response was not in the expected text format.");
    }

    const jsonText = response.output_text;
    return JSON.parse(jsonText);
  } catch (error) {
    console.error("Error in AI service while extracting receipt data:", error);
    // Re-throw the error to be handled by the caller
    throw error;
  }
}
