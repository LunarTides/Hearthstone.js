import { json } from "@sveltejs/kit";
import { db } from "$lib/server/db";
import * as table from "$lib/db/schema";
import { getSetting } from "$lib/server/db/setting.js";
import { censorUser } from "$lib/user";
import { desc } from "drizzle-orm";

export async function GET(event) {
	const clientUser = event.locals.user;

	const page = parseInt(event.url.searchParams.get("page") || "1");
	if (Number.isNaN(page) || page <= 0) {
		return json({ message: "Please specify a valid page." }, { status: 400 });
	}

	const pageSize = (await getSetting("api.pageSize")) as number;
	// TODO: Add setting for this.
	// const leaderboardEntries = (await getSetting("api.leaderboard.entries")) as number;
	if (page > 100 / pageSize) {
		return json({ message: "The page number is too high." }, { status: 400 });
	}

	// TODO: Make this work with groups.
	const users = await db
		.select()
		.from(table.user)
		.orderBy(desc(table.user.karma))
		.limit(pageSize)
		.offset((page - 1) * pageSize);

	return json(users.map((user) => censorUser(user, clientUser, { karma: false })));
}
