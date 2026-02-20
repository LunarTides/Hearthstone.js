import { json } from "@sveltejs/kit";
import { db } from "$lib/server/db";
import * as table from "$lib/db/schema";
import { getSetting } from "$lib/server/db/setting.js";
import { censorUser } from "$lib/user";
import { desc } from "drizzle-orm";
import { censorGroup } from "$lib/group.js";
import type { User } from "$lib/db/schema";

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

	// TODO: Make the pagination less stupid.
	const users = await db
		.select()
		.from(table.user)
		.orderBy(desc(table.user.karma))
		.limit(pageSize / 2)
		.offset((page - 1) * (pageSize / 2));

	const groups = await db
		.select()
		.from(table.group)
		.orderBy(desc(table.group.karma))
		.limit(pageSize / 2)
		.offset((page - 1) * (pageSize / 2));

	// Combine the users and groups.
	const mix = [...users, ...groups]
		.toSorted((a, b) => b.karma - a.karma)
		.map((obj) => ({ ...obj, type: Object.hasOwn(obj, "role") ? "User" : "Group" }));

	const leaderboard = mix.map((obj) =>
		obj.type === "User"
			? censorUser(obj as unknown as User, clientUser, { karma: false })
			: censorGroup(obj, clientUser, { karma: false }),
	);

	return json(leaderboard);
}
