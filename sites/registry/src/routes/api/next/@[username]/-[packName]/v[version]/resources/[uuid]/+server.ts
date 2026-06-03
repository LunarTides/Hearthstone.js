import { db } from "$lib/server/db/index.js";
import * as table from "$lib/db/schema.js";
import { json } from "@sveltejs/kit";
import { eq, and } from "drizzle-orm";
import { isUserMemberOfGroup } from "$lib/server/db/group.js";

export async function GET(event) {
	const clientUser = event.locals.user;

	const { username, packName, version, uuid } = event.params;

	const resource = (
		await db
			.select()
			.from(table.resource)
			.fullJoin(table.pack, eq(table.pack.id, table.resource.packId))
			.where(
				and(
					eq(table.pack.ownerName, username),
					eq(table.pack.name, packName),
					eq(table.pack.packVersion, version),
					eq(table.resource.uuid, uuid),
				),
			)
			.limit(1)
	).at(0);
	if (!resource) {
		return json({ message: "Resource not found." }, { status: 404 });
	}

	if (!resource.pack || !resource.resource) {
		return json({ message: "Resource object is invalid for some reason." }, { status: 500 });
	}

	if (
		!resource.pack.approved &&
		!(await isUserMemberOfGroup(clientUser, clientUser?.username, username))
	) {
		return json({ message: "Version not found." }, { status: 404 });
	}

	return json(resource.resource);
}
