import { db } from "$lib/server/db/index.js";
import * as table from "$lib/db/schema.js";
import { error } from "@sveltejs/kit";
import { eq, and } from "drizzle-orm";
import { loadGetPack } from "$lib/server/db/pack.js";
import { satisfiesRole } from "$lib/user.js";
import { requestAPI } from "$lib/api/helper";
import { resolve } from "$app/paths";
import type { File } from "$lib/api/types";

export const load = async (event) => {
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
		// NOTE: Using `packId` works.
		const packs = await loadGetPack(user, cards[0].packId, "");

		if (!user || (packs.latest.ownerName !== user.username && !satisfiesRole(user, "Moderator"))) {
			cards = cards.filter((c) => c.approved);
		}

		const currentPack = packs.all.find((v) => v.id === event.params.id);
		if (!currentPack) {
			return error(404, { message: "The requested pack does not exist." });
		}

		const files = await Promise.all(
			cards.map(async (card) => {
				const pack = packs.all.find((pack) => pack.id === card.packId);
				if (!pack) {
					return error(404, { message: "Card doesn't belong to a pack." });
				}

				const response = await requestAPI<File>(
					event,
					resolve("/api/next/@[username]/-[packName]/versions/[version]/[id]/files/[...path]", {
						username: pack.ownerName,
						packName: pack.name,
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

		const currentCard = cards.find((c) => c.packId === currentPack.id)!;

		return {
			packs,
			latest,
			all: cards,
			files,
			current: currentCard,
			currentPack,
		};
	};

	// TODO: Make this proper async.
	const relevantCards = await getCards();

	return {
		relevantCards,
	};
};
