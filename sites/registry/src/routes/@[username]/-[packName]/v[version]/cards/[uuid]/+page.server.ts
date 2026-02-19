import { error, type ServerLoadEvent } from "@sveltejs/kit";
import { requestAPI } from "$lib/api/helper";
import { resolve } from "$app/paths";
import type { File } from "$lib/api/types";
import type { Card, CommentWithExtras } from "$lib/db/schema.js";
import type { CensoredPack } from "$lib/pack.js";
import { superValidate } from "sveltekit-superforms";
import { zod4 } from "sveltekit-superforms/adapters";
import { postSchema } from "../../comments/schema.js";

const getComments = async (event: ServerLoadEvent) => {
	// TODO: Support pagination.
	const response = await requestAPI<CommentWithExtras[]>(
		event,
		resolve("/api/next/@[username]/-[packName]/comments", {
			username: event.params.username!,
			packName: event.params.packName!,
		}) + `?cardUUID=${event.params.uuid}`,
	);

	if (response.error) {
		return error(response.error.status, { message: response.error.message });
	}

	const amount = parseInt(response.raw.headers.get("X-Comment-Amount")!, 10);

	return { comments: response.json, amount };
};

const getCards = async (event: ServerLoadEvent) => {
	const { username, packName, version, uuid } = event.params;

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
			uuid: uuid!,
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

export const load = async (event) => {
	// TODO: Make this proper async.
	const form = await superValidate(zod4(postSchema));
	const relevantCards = await getCards(event);
	const commentsObject = await getComments(event);

	return {
		form,
		relevantCards,
		commentsObject,
	};
};
