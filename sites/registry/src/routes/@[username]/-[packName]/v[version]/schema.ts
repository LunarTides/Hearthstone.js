import z from "zod";

export const dummySchema = z.object();

export const approveSchema = z.object({
	message: z.string().default(""),
	messageType: z.enum(["public", "internal"]),
	karma: z.number().positive("The amount of karma needs to be positive.").default(100),
});
