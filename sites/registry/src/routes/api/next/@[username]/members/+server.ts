import { json } from "@sveltejs/kit";
import { db } from "$lib/server/db";
import * as table from "$lib/db/schema";
import { eq } from "drizzle-orm";
import { getFullGroups } from "$lib/server/db/group.js";

export async function GET(event) {
	const clientUser = event.locals.user;
	const { username: groupName } = event.params;

	// TODO: Maybe censor the permissions?
	const groups = await getFullGroups(
		clientUser,
		db
			.select()
			.from(table.group)
			.where(eq(table.group.username, groupName))
			// Sort alphabetically.
			.orderBy(table.groupMember.username)
			.$dynamic(),
	);

	const members = groups.flatMap((g) => g.members);

	return json({ members });
}
