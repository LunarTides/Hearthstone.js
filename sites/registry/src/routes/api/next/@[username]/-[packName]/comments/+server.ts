import { db } from "$lib/server/db/index.js";
import * as table from "$lib/db/schema.js";
import { json } from "@sveltejs/kit";
import { eq, and, count, inArray } from "drizzle-orm";
import { getFullPackComment } from "$lib/server/db/comment.js";
import { getSetting } from "$lib/server/db/setting";
import { isUserMemberOfPack } from "$lib/server/db/pack.js";

export async function GET(event) {
	// TODO: Extract page logic.
	const page = parseInt(event.url.searchParams.get("page") || "1");
	if (Number.isNaN(page) || page <= 0) {
		return json({ message: "Please specify a valid page." }, { status: 400 });
	}

	const clientUser = event.locals.user;

	const username = event.params.username;
	const packName = event.params.packName;

	const packs = await db
		.select()
		.from(table.pack)
		.where(and(eq(table.pack.ownerName, username), eq(table.pack.name, packName)));
	if (packs.length <= 0) {
		return json({ message: "Version not found." }, { status: 404 });
	}

	const pack = packs.find((p) => p.isLatestVersion) ?? packs[0];
	if (!pack.approved && !isUserMemberOfPack(clientUser, username, pack)) {
		return json({ message: "Version not found." }, { status: 404 });
	}

	const pageSize = (await getSetting("api.pageSize")) as number;

	const comments = await getFullPackComment(
		clientUser,
		db
			.select()
			.from(table.packComment)
			.where(
				inArray(
					table.packComment.packId,
					packs.map((p) => p.id),
				),
			)
			.limit(pageSize)
			.offset((page - 1) * pageSize)
			.$dynamic(),
	);

	const amount = await db
		.select({ count: count() })
		.from(table.packComment)
		.where(
			inArray(
				table.packComment.packId,
				packs.map((p) => p.id),
			),
		);

	return json(comments, {
		headers: {
			"X-Comment-Amount": amount[0].count.toString(),
		},
	});
}
