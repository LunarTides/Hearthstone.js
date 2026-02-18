import { db } from "$lib/server/db/index.js";
import * as table from "$lib/db/schema.js";
import { json } from "@sveltejs/kit";
import { eq, and } from "drizzle-orm";
import { isUserMemberOfPack } from "$lib/server/db/pack.js";

export async function GET(event) {
	const clientUser = event.locals.user;

	const { username, packName, version, uuid } = event.params;

	const card = (
		await db
			.select()
			.from(table.card)
			.fullJoin(table.pack, eq(table.pack.id, table.card.packId))
			.where(
				and(
					eq(table.pack.ownerName, username),
					eq(table.pack.name, packName),
					eq(table.pack.packVersion, version),
					eq(table.card.uuid, uuid),
				),
			)
			.limit(1)
	).at(0);
	if (!card) {
		return json({ message: "Card not found." }, { status: 404 });
	}

	if (!card.pack || !card.card) {
		return json({ message: "Card object is invalid for some reason." }, { status: 500 });
	}

	if (!card.pack.approved && !isUserMemberOfPack(clientUser, username, card.pack)) {
		return json({ message: "Version not found." }, { status: 404 });
	}

	return json(card.card);
}
