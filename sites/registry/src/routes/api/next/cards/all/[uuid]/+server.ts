import { db } from "$lib/server/db/index.js";
import * as table from "$lib/db/schema.js";
import { json } from "@sveltejs/kit";
import { eq, and } from "drizzle-orm";
import { censorPack } from "$lib/pack.js";
import { isUserMemberOfGroup } from "$lib/server/db/group.js";

// FIXME: This could also quickly explode in size.
export async function GET(event) {
	const clientUser = event.locals.user;

	const { uuid } = event.params;

	let cards = await db
		.select()
		.from(table.card)
		.fullJoin(table.pack, eq(table.pack.id, table.card.packId))
		.where(and(eq(table.card.uuid, uuid)));
	if (cards.length <= 0) {
		return json({ message: "Card not found." }, { status: 404 });
	}

	const latest = cards.find((c) => c.card?.isLatestVersion)!;
	if (!latest.pack || !latest.card) {
		return json({ message: "Card object is invalid for some reason." }, { status: 500 });
	}

	if (
		!latest.card.approved &&
		!(await isUserMemberOfGroup(clientUser, clientUser?.username, latest.pack.ownerName))
	) {
		cards = cards.filter((c) => c.card?.approved);
	}

	return json({
		latest: {
			card: latest.card,
			pack: censorPack(latest.pack!, clientUser),
		},
		outdated: cards
			.filter((c) => c.pack?.id !== latest.pack?.id)
			.map((c) => ({
				card: c.card,
				pack: censorPack(c.pack!, clientUser),
			})),
	});
}
