import { json } from "@sveltejs/kit";
import { db } from "$lib/server/db";
import * as table from "$lib/db/schema";
import { and, eq } from "drizzle-orm";
import { censorGroup } from "$lib/group.js";
import { hasGradualPermission } from "$lib/server/auth";

export async function GET(event) {
	const clientUser = event.locals.user;
	const { username } = event.params;

	if (!hasGradualPermission(event.locals.token?.permissions, "groups.get.is-member-of")) {
		return json({ message: "This request is outside the scope of this token." }, { status: 403 });
	}

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
