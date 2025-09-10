import { imgAnnotator } from "server/gcloudClient";

export const getTextFromImage = async (imageUrl: string) => {
  const [result] = await imgAnnotator.textDetection(imageUrl);
  const textAnnotationArray = result.textAnnotations;

  if (
    !textAnnotationArray ||
    textAnnotationArray.length === 0 ||
    !textAnnotationArray[0].description
  ) {
    console.error(
      "No text annotations found. textAnnotationArray:",
      textAnnotationArray,
    );
    return {
      text: null,
      error: "No text annotations found",
      raw: JSON.stringify(textAnnotationArray, null, 2),
    };
  }

  return {
    text: textAnnotationArray[0].description,
    error: null,
    raw: null,
  };
};
