import { db } from "$lib/server/db/index.js";
import * as table from "$lib/db/schema.js";
import { error } from "@sveltejs/kit";
import { eq, and } from "drizzle-orm";
import { loadGetPack } from "$lib/server/db/pack.js";
import { satisfiesRole } from "$lib/user.js";
import { requestAPI } from "$lib/api/helper";
import { resolve } from "$app/paths";
import type { File } from "$lib/api/types";

export const load = (event) => {
	const user = event.locals.user;
	const uuid = event.params.uuid;

	const getCards = async () => {
		let cards = await db
			.select()
			.from(table.card)
			.where(and(eq(table.card.uuid, uuid)));
		if (cards.length <= 0) {
			error(404, { message: "Card not found." });
		}

		const latest = cards.find((c) => c.isLatestVersion)!;
		const packs = await loadGetPack(user, cards[0].packId);

		if (!user || (packs.latest.ownerName !== user.username && !satisfiesRole(user, "Moderator"))) {
			cards = cards.filter((c) => c.approved);
		}

		const files = await Promise.all(
			cards.map(async (card) => {
				const pack = packs.all.find((pack) => pack.id === card.packId);
				if (!pack) {
					return error(404, { message: "Card doesn't belong to a pack." });
				}

				const response = await requestAPI<File>(
					event,
					resolve("/api/v1/pack/[uuid]/versions/[version]/[id]/files/[...path]", {
						uuid: pack.uuid,
						version: pack.packVersion,
						id: pack.id,
						// Remove leading slash.
						path: card.filePath.replace(/^\//, ""),
					}),
				);
				if (response.error) {
					return error(response.error.status, { message: response.error.message });
				}

				return {
					id: card.id,
					file: response.json,
				};
			}),
		);

		return {
			packs,
			latest: latest,
			all: cards,
			files,
		};
	};

	return {
		cards: getCards(),
	};
};
