import z from "zod";

export default z.object({
	username: z
		.string()
		.nonempty("You must specify a username.")
		.min(3)
		.max(31)
		.regex(/^[a-zA-Z0-9_-]+$/),
});
