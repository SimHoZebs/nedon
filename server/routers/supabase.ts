import { procedure, router } from "server/trpc";
import { z } from "zod";

const supabaseRouter = router({
  uploadImg: procedure
    .input(
      z.object({
        img: z.instanceof(File),
      }),
    )
    .mutation(async ({ input }) => {}),
});
export default supabaseRouter;
