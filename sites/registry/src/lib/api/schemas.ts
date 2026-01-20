import z from "zod";

export const dummySchema = z.object();

export const loginSchema = z.object({
	username: z
		.string()
		.min(3)
		.max(31)
		.regex(/^[a-zA-Z0-9_-]+$/),
	password: z.string().min(6).max(255),
});

export const approveSchema = z.object({
	message: z.string().default(""),
	messageType: z.enum(["public", "internal"]),
});

export const uploadSchema = z.object({
	file: z.file().mime("application/gzip"),
});
