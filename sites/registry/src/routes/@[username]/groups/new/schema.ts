import z from "zod";

export default z.object({
	name: z
		.string()
		.nonempty("The pack's name cannot be empty.")
		.min(3)
		.max(31)
		.regex(/^[a-zA-Z0-9_-]+$/),
});
