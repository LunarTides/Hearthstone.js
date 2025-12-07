import { db } from "$lib/server/db/index.js";
import { pack } from "$lib/server/db/schema.js";
import { like } from "drizzle-orm";

export const actions = {
	default: async (event) => {
		const formData = await event.request.formData();
		const query = formData.get("query");
		if (!query) {
			return;
		}

		// TODO: Filter by approved.
		const packs = await db
			.select()
			.from(pack)
			.where(like(pack.name, `%${query}%`));

		return { packs };
	},
};
