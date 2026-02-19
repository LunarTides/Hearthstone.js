import z from "zod";

export const postSchema = z.object({
	text: z.string().nonempty(),
	cardUUID: z.string().nullable(),
});
