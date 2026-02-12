import { resolve } from "$app/paths";
import { requestAPI } from "$lib/api/helper.js";
import type { Card, PackWithExtras } from "$lib/db/schema.js";
import * as table from "$lib/db/schema.js";
import { db } from "$lib/server/db/index.js";
import { getFullPacks } from "$lib/server/db/pack";
import { satisfiesRole } from "$lib/user.js";
import { error, fail } from "@sveltejs/kit";
import { eq } from "drizzle-orm";
import semver from "semver";

const packSortingFunction = (a: PackWithExtras, b: PackWithExtras) => {
	if (!a.approved && b.approved) {
		return 1;
	} else if (a.approved && !b.approved) {
		return -1;
	}

	return semver.compare(b.packVersion, a.packVersion);
};

// TODO: Deduplicate from `pack/[uuid]/+layout.server.ts`
export const load = async (event) => {
	// TODO: Stream like in `routes/+layout.server.ts`.
	const user = event.locals.user;
	const username = event.params.username;

	const packs = await getFullPacks(
		user,
		db.select().from(table.pack).where(eq(table.pack.ownerName, username)).$dynamic(),
		false,
	);
	if (packs.length <= 0) {
		return {
			packs: [],
			cards: [],
		};
	}

	const pack = packs[0];
	const packsToReturn = [];

	const uniquePackNames = new Set(packs.map((p) => p.name));
	for (const uniquePackName of uniquePackNames) {
		const relevantPacks = packs.filter((p) => p.name === uniquePackName);
		packsToReturn.push({
			uuid: uniquePackName,
			relevantPacks: relevantPacks.toSorted(packSortingFunction),
		});
	}

	packsToReturn.sort((a, b) => {
		const ap = a.relevantPacks.at(0);
		if (!ap) {
			return 1;
		}

		const bp = b.relevantPacks.at(0);
		if (!bp) {
			return -1;
		}

		return ap.name.localeCompare(bp.name);
	});

	const response = await requestAPI<Card[]>(
		event,
		resolve("/api/next/@[username]/-[packName]/versions/[version]/[id]/cards", {
			username: pack.ownerName,
			packName: pack.name,
			version: pack.packVersion,
			id: pack.id,
		}),
	);
	if (response.error) {
		return error(response.error.status, { message: response.error.message });
	}

	return {
		packs: packsToReturn,
		cards: response.json,
	};
};

export const actions = {
	edit: async (event) => {
		const user = event.locals.user;
		if (!user) {
			return fail(401, { message: "Please log in." });
		}

		const username = event.params.username;

		if (user.username !== username && !satisfiesRole(user, "Admin")) {
			return fail(403, { message: "You do not have the the necessary privileges to do this." });
		}

		const formData = await event.request.formData();
		const response = await requestAPI(
			event,
			resolve("/api/next/@[username]", {
				username,
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
		if (response.error) {
			return fail(response.error.status, { message: response.error.message });
		}
	},
};
