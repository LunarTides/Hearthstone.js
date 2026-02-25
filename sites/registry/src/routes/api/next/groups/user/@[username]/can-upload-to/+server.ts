import { json } from "@sveltejs/kit";
import { db } from "$lib/server/db";
import * as table from "$lib/db/schema";
import { and, eq } from "drizzle-orm";
import { censorGroup, memberHasPermission } from "$lib/group.js";
import { hasGradualPermission } from "$lib/server/auth";

export async function GET(event) {
	const clientUser = event.locals.user;
	if (!clientUser) {
		return json({ message: "Please log in." }, { status: 401 });
	}

	if (!hasGradualPermission(event.locals.token?.permissions, "groups.get.can-upload-to")) {
		return json({ message: "This request is outside the scope of this token." }, { status: 403 });
	}

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

	const groups = result
		.filter((r) => memberHasPermission(r.groupMember.permissions, "pack.upload"))
		.map((r) => censorGroup(r.group, clientUser));
	return json({ groups });
}
