import { db } from "$lib/server/db/index.js";
import * as table from "$lib/db/schema.js";
import { json } from "@sveltejs/kit";
import { eq, and } from "drizzle-orm";
import { isUserMemberOfGroup } from "$lib/server/db/group.js";

export async function GET(event) {
	const user = event.locals.user;

	const username = event.params.username;
	const packName = event.params.packName;
	const packVersion = event.params.version;

	const pack = (
		await db
			.select()
			.from(table.pack)
			.where(
				and(
					eq(table.pack.ownerName, username),
					eq(table.pack.name, packName),
					eq(table.pack.packVersion, packVersion),
				),
			)
	).at(0);
	if (!pack) {
		return json({ message: "Version not found." }, { status: 404 });
	}

	if (!pack.approved && !(await isUserMemberOfGroup(user, user?.username, username))) {
		return json({ message: "Version not found." }, { status: 404 });
	}

	const resources = await db
		.select()
		.from(table.resource)
		.where(eq(table.resource.packId, pack.id));
	return json(resources);
}
