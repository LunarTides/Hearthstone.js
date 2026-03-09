import z from "zod";

export const postSchema = z.object({
	text: z.string().nonempty(),
	filePath: z.string().nullable(),
});
