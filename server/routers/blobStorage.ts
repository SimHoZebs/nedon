import { getSignedUploadUrl } from "../services/blobStorage";

import { procedure, router } from "server/trpc";
import { z } from "zod";

const blobStorageRouter = router({
  uploadImg: procedure
    .input(
      z.object({
        img: z.instanceof(File),
      }),
    )
    .mutation(async ({ input }) => {}),

  getSignedUploadUrl: procedure
    .input(z.object({ path: z.string() }))
    .mutation(async ({ input }) => {
      return await getSignedUploadUrl(input.path);
    }),
});
export default blobStorageRouter;
