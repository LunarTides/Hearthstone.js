import { json } from "@sveltejs/kit";
import { db } from "$lib/server/db";
import * as table from "$lib/db/schema";
import { and, eq } from "drizzle-orm";
import { censorGroup } from "$lib/group.js";

export async function GET(event) {
	const clientUser = event.locals.user;
	const { username } = event.params;

	const result = await db
		.select()
		.from(table.group)
		.innerJoin(
			table.groupMember,
			and(
				eq(table.groupMember.groupName, table.group.username),
				eq(table.groupMember.username, username),
			),
		);

	const groups = result.map((r) => censorGroup(r.group, clientUser));
	return json({ groups });
}
