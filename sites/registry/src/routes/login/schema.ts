import z from "zod";

export default z.object({
	username: z
		.string()
		.min(3)
		.max(31)
		// NOTE: The minus has to be escaped to be used in HTML `input`,
		// otherwise it spams the console with errors.
		// eslint-disable-next-line no-useless-escape
		.regex(/^[a-zA-Z0-9_\-]+$/),
	password: z.string().min(6).max(255),
});
