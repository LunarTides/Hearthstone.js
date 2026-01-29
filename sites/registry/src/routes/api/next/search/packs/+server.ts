import { json } from "@sveltejs/kit";
import { db } from "$lib/server/db";
import * as table from "$lib/db/schema";
import { like, and, eq } from "drizzle-orm";
import { getFullPacks } from "$lib/server/db/pack";
import { getSetting } from "$lib/server/db/setting";

export async function GET(event) {
	const query = event.url.searchParams.get("q");
	if (!query) {
		return json({ message: "Please specify a search query." }, { status: 400 });
	}

	const page = parseInt(event.url.searchParams.get("page") || "1");
	if (Number.isNaN(page) || page <= 0) {
		return json({ message: "Please specify a valid page." }, { status: 400 });
	}

	// TODO: This doesn't show loading... in search page, it just stops.
	// await new Promise((resolve) => {
	// 	setTimeout(resolve, 1000);
	// });

	const pageSize = (await getSetting("api.pageSize")) as number;

	const packs = await getFullPacks(
		event.locals.user,
		db
			.select()
			.from(table.pack)
			// TODO: Ignore caps.
			// TODO: Make this smarter.
			.where(and(like(table.pack.name, `%${query}%`), eq(table.pack.approved, true)))
			.limit(pageSize)
			.offset((page - 1) * pageSize)
			.$dynamic(),
		false,
	);

	return json(packs.filter((p) => p.isLatestVersion));
}
