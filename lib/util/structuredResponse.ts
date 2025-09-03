export type StructuredResponse<T> =
  | { success: true; data: T; clientMsg: string; devMsg: string }
  | { success: false; data: undefined; clientMsg: string; devMsg: string };

export const createStructuredResponse = <T>({
  success = false,
  data,
  clientMsg = "Something went wrong. This is a generic error message we don't yet have a specific message for. Please try again or contact support.",
  devMsg = "",
}: StructuredResponse<T>) => {
  return { success, data, clientMsg, devMsg };
};
