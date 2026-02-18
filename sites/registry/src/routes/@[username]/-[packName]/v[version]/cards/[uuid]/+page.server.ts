import { error } from "@sveltejs/kit";
import { requestAPI } from "$lib/api/helper";
import { resolve } from "$app/paths";
import type { File } from "$lib/api/types";
import type { Card } from "$lib/db/schema.js";
import type { CensoredPack } from "$lib/pack.js";

export const load = async (event) => {
	const { username, packName, version, uuid } = event.params;

	const getCards = async () => {
		const cardResponse = await requestAPI<{
			latest: {
				card: Card;
				pack: CensoredPack;
			};
			outdated: {
				card: Card;
				pack: CensoredPack;
			}[];
		}>(
			event,
			resolve("/api/next/cards/all/[uuid]", {
				uuid,
			}),
		);
		if (cardResponse.error) {
			return error(cardResponse.error.status, { message: cardResponse.error.message });
		}

		const cards = cardResponse.json;
		const currentCard = [cards.latest, ...cards.outdated].find(
			(c) =>
				c.pack.ownerName === username && c.pack.name === packName && c.pack.packVersion === version,
		);
		if (!currentCard) {
			return error(404, { message: "This card doesn't exist." });
		}

		const fileResponse = await requestAPI<File>(
			event,
			resolve("/api/next/@[username]/-[packName]/v[version]/files/[...path]", {
				username: currentCard.pack.ownerName,
				packName: currentCard.pack.name,
				version: currentCard.pack.packVersion,
				// Remove leading slash.
				path: currentCard.card.filePath.replace(/^\//, ""),
			}),
		);
		if (fileResponse.error) {
			return error(fileResponse.error.status, { message: fileResponse.error.message });
		}

		return {
			packs: {
				latest: cards.latest.pack,
				all: [cards.latest, ...cards.outdated].map((c) => c.pack),
			},
			latest: cards.latest.card,
			all: [cards.latest, ...cards.outdated].map((c) => c.card),
			file: fileResponse.json,
			current: currentCard.card,
			currentPack: currentCard.pack,
		};
	};

	// TODO: Make this proper async.
	const relevantCards = await getCards();

	return {
		relevantCards,
	};
};
