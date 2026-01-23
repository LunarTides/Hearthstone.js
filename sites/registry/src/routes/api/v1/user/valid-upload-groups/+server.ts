import { json } from "@sveltejs/kit";
import { db } from "$lib/server/db";
import * as table from "$lib/db/schema";
import { and, arrayContains, eq } from "drizzle-orm";

export async function GET(event) {
	const clientUser = event.locals.user;
	if (!clientUser) {
		return json({ message: "Please log in." }, { status: 401 });
	}

	const result = await db
		.select()
		.from(table.group)
		.innerJoin(
			table.groupMember,
			and(
				eq(table.groupMember.groupName, table.group.username),
				eq(table.groupMember.username, clientUser.username),
			),
		)
		.where(arrayContains(table.groupMember.permissions, ["upload"]))
		.limit(1);

	const groups = result.map((r) => r.group.username);
	return json({ groups });
}
