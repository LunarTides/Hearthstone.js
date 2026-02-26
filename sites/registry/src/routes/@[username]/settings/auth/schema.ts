import z from "zod";

export const postTokenSchema = z.object({
	name: z.string().nonempty(),
	permissions: z.string().array(),
});
