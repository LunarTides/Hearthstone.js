import { db } from "$lib/server/db/index.js";
import * as table from "$lib/db/schema.js";
import { json } from "@sveltejs/kit";
import { eq, and } from "drizzle-orm";
import { satisfiesRole } from "$lib/user.js";

export async function GET(event) {
	const user = event.locals.user;

	const username = event.params.username;
	const packName = event.params.packName;
	const packVersion = event.params.version;
	const id = event.params.id;

	const pack = (
		await db
			.select()
			.from(table.pack)
			.where(
				and(
					eq(table.pack.ownerName, username),
					eq(table.pack.name, packName),
					eq(table.pack.packVersion, packVersion),
					eq(table.pack.id, id),
				),
			)
	).at(0);
	if (!pack) {
		return json({ message: "Version not found." }, { status: 404 });
	}

	if (!pack.approved) {
		// eslint-disable-next-line no-empty
		if (user && (pack.ownerName === user.username || satisfiesRole(user, "Moderator"))) {
		} else {
			return json({ message: "Version not found." }, { status: 404 });
		}
	}

	const cards = await db.select().from(table.card).where(eq(table.card.packId, pack.id));

	return json(cards);
}
