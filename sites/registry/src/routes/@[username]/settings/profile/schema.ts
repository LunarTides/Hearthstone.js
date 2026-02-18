import { rolesEnum } from "$lib/db/schema";
import z from "zod";

export default z.object({
	aboutMe: z.string().optional(),
	pronouns: z
		.string()
		.regex(/(?:.+\/.+|^$)/, "The prounouns needs to be formatted like this: subject/object")
		.optional(),
	role: z.enum(rolesEnum.enumValues),
});
