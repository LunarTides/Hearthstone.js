import z from "zod";

export default z.object({
	file: z.file().mime("application/gzip"),
	ownerName: z.string(),
	packName: z
		.string()
		.nonempty("The pack's name cannot be empty.")
		.regex(
			/[A-Za-z_][A-Za-z_\d]*/,
			"The pack's name can only contain letters, numbers, and underscores. It also cannot start with a number.",
		),
});
