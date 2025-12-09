import { m } from "$lib/paraglide/messages.js";
import { json } from "@sveltejs/kit";
import { db } from "$lib/server/db";
import { card, pack } from "$lib/server/db/schema";
import { like, and, eq } from "drizzle-orm";

export async function GET(event) {
	const query = event.url.searchParams.get("q");
	if (!query) {
		return json({ message: m.query_not_found() }, { status: 400 });
	}

	const page = parseInt(event.url.searchParams.get("page") || "1");
	if (Number.isNaN(page) || page <= 0) {
		return json({ message: m.gray_steep_husky_gaze() }, { status: 400 });
	}

	const cards = async () => {
		const cards = await db
			.select()
			.from(card)
			// TODO: Ignore caps.
			// TODO: Make this smarter.
			.where(and(like(card.name, `%${query}%`), eq(card.isLatestVersion, true)))
			.innerJoin(pack, eq(card.packId, pack.id))
			// TODO: Add setting for page size.
			.limit(10)
			.offset((page - 1) * 10);

		return cards;
	};

	return json(await cards());
}
