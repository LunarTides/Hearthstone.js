import z from "zod";

export const postTokenSchema = z.object({
	permissions: z.string().array(),
});
