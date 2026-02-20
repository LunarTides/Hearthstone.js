import { db } from "$lib/server/db/index.js";
import * as table from "$lib/db/schema.js";
import { eq } from "drizzle-orm";

export async function notify(username: string, text: string, route?: string) {
	// Handle groups
	const group = (
		await db.select().from(table.group).where(eq(table.group.username, username)).limit(1)
	).at(0);
	if (group) {
		const groupMembers = await db
			.select({ username: table.groupMember.username })
			.from(table.groupMember)
			.where(eq(table.groupMember.groupName, username));
		const values = groupMembers.map((member) => ({
			username: member.username,
			text,
			route,
		}));

		await db.insert(table.notification).values(values);
		return;
	}

	// Handle users
	await db.insert(table.notification).values({
		username,
		text,
		route,
	});
}
