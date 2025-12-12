import { m } from "$lib/paraglide/messages.js";
import { json } from "@sveltejs/kit";
import { db } from "$lib/server/db";
import { pack } from "$lib/db/schema";
import { like } from "drizzle-orm";
import { getAllDownloads } from "$lib/pack.js";

export async function GET(event) {
	const query = event.url.searchParams.get("q");
	if (!query) {
		return json({ message: m.query_not_found() }, { status: 400 });
	}

	const page = parseInt(event.url.searchParams.get("page") || "1");
	if (Number.isNaN(page) || page <= 0) {
		return json({ message: m.gray_steep_husky_gaze() }, { status: 400 });
	}

	// TODO: This doesn't show loading... in search page, it just stops.
	// await new Promise((resolve) => {
	// 	setTimeout(resolve, 1000);
	// });

	const packs = async () => {
		// TODO: Filter by approved.
		let packs = await db
			.select()
			.from(pack)
			// TODO: Make this smarter.
			.where(like(pack.name, `%${query}%`))
			// TODO: Add setting for page size.
			.limit(10)
			.offset((page - 1) * 10);

		// Show all downloads from all versions.
		packs = packs.map((p) => ({
			...p,
			downloadCount: getAllDownloads(packs.filter((v) => v.uuid === p.uuid)),
		}));
		packs = packs.filter((p) => p.isLatestVersion);

		return packs;
	};

	return json(await packs());
}
