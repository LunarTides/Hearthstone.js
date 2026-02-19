import z from "zod";

export default z.object({
	username: z
		.string()
		.min(3)
		.max(31)
		.regex(/^[a-zA-Z0-9_-]+$/),
	password: z.string().min(6).max(255),
});
