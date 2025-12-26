import { resolve } from "$app/paths";
import { pack, type Card } from "$lib/db/schema.js";
import { db } from "$lib/server/db/index.js";
import { getFullPacks } from "$lib/server/db/pack";
import { satisfiesRole } from "$lib/user.js";
import { error, fail } from "@sveltejs/kit";
import { and, arrayContains } from "drizzle-orm";

// TODO: Deduplicate from `pack/[uuid]/+layout.server.ts`
export const load = async (event) => {
	// TODO: Stream like in `routes/+layout.server.ts`.
	const user = event.locals.user;
	const uuid = event.params.uuid;

	const packs = await getFullPacks(
		user,
		db
			.select()
			.from(pack)
			.where(and(arrayContains(pack.userIds, [uuid])))
			.$dynamic(),
	);
	if (packs.length <= 0) {
		return {
			packs: [],
			cards: [],
		};
	}

	const version = packs[0];

	const packsToReturn = [];

	const uniquePacks = new Set(packs.map((p) => p.uuid));
	for (const uniquePack of uniquePacks) {
		const relevantPacks = packs.filter((p) => p.uuid === uniquePack);
		packsToReturn.push({
			uuid: uniquePack,
			relevantPacks,
		});
	}

	const response = await event.fetch(
		resolve("/api/v1/pack/[uuid]/versions/[version]/cards", {
			uuid: version.uuid,
			version: version.packVersion,
		}),
	);

	const json = await response.json();
	if (response.status !== 200) {
		return error(response.status, { message: json.message });
	}

	return {
		packs: packsToReturn,
		cards: json as Card[],
	};
};

export const actions = {
	edit: async (event) => {
		const user = event.locals.user;
		if (!user) {
			return fail(401, { message: "Please log in." });
		}

		const uuid = event.params.uuid;

		if (user.id !== uuid && !satisfiesRole(user, "Admin")) {
			return fail(403, { message: "You do not have the the necessary privileges to do this." });
		}

		const formData = await event.request.formData();
		const response = await event.fetch(
			resolve("/api/v1/user/[uuid]", {
				uuid,
			}),
			{
				method: "PUT",
				body: JSON.stringify({
					username: formData.get("username"),
					pronouns: formData.get("pronouns"),
					aboutMe: (formData.get("aboutMe") as string | null)?.replaceAll("\r\n", "\n"),
					role: formData.get("role"),
				}),
			},
		);
		if (response.status !== 200) {
			const json = await response.json();
			return fail(response.status, { message: json.message });
		}
	},
};
