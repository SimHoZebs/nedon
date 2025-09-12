import supabase from "server/clients/supabaseClient";

const BUCKET_NAME = "receipts";

export const getSignedUploadUrl = async (path: string) => {
  const { data, error } = await supabase.storage
    .from(BUCKET_NAME)
    .createSignedUploadUrl(path);
  if (error) {
    throw new Error(`Failed to create signed upload URL: ${error.message}`);
  }
  return data;
};

export const getSignedUrl = async (path: string, expiresIn: number) => {
  const { data, error } = await supabase.storage
    .from(BUCKET_NAME)
    .createSignedUrl(path, expiresIn);

  if (error) {
    throw new Error(`Failed to create signed download URL: ${error.message}`);
  }

  return data;
};
