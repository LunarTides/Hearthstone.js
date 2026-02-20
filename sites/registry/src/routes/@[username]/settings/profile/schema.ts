import { rolesEnum } from "$lib/db/schema";
import z from "zod";

export const userSchema = z.object({
	type: z.literal("User"),
	aboutMe: z.string().optional(),
	pronouns: z
		.string()
		.regex(/(?:.+\/.+|^$)/, "The prounouns needs to be formatted like this: subject/object")
		.optional(),
	role: z.enum(rolesEnum.enumValues),
});

export const groupSchema = z.object({
	type: z.literal("Group"),
	aboutMe: z.string().optional(),
});
