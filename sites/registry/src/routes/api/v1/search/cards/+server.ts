import { json } from "@sveltejs/kit";
import { db } from "$lib/server/db";
import * as table from "$lib/db/schema";
import { like, and, eq } from "drizzle-orm";
import { getSetting } from "$lib/server/db/setting.js";

export async function GET(event) {
	const query = event.url.searchParams.get("q");
	if (!query) {
		return json({ message: "Please specify a search query." }, { status: 400 });
	}

	const page = parseInt(event.url.searchParams.get("page") || "1");
	if (Number.isNaN(page) || page <= 0) {
		return json({ message: "Please specify a valid page." }, { status: 400 });
	}

	const pageSize = (await getSetting("api.pageSize")) as number;

	const cards = async () => {
		const cards = await db
			.select()
			.from(table.card)
			// TODO: Ignore caps.
			// TODO: Make this smarter.
			.where(
				and(
					like(table.card.name, `%${query}%`),
					eq(table.pack.approved, true),
					eq(table.card.isLatestVersion, true),
				),
			)
			.innerJoin(table.pack, eq(table.card.packId, table.pack.id))
			.limit(pageSize)
			.offset((page - 1) * pageSize);

		return cards;
	};

	return json(await cards());
}
