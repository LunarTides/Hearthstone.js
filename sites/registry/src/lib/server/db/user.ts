import { db } from "$lib/server/db";
import * as table from "$lib/db/schema.js";
import { eq } from "drizzle-orm";

/**
 * @param username The username of the user to grant karma to.
 * @param amount The amount of karma to grant. Can be negative.
 * @returns The total amount of karma the user now has, or `null` if the specified user doesn't exist.
 */
export async function grantKarma(username: string, amount: number) {
	const user = (
		await db
			.select({ karma: table.user.karma })
			.from(table.user)
			.where(eq(table.user.username, username))
	).at(0);
	if (!user) {
		const group = (
			await db
				.select({ karma: table.group.karma })
				.from(table.group)
				.where(eq(table.group.username, username))
		).at(0);
		if (!group) {
			return null;
		}

		const updatedGroups = await db
			.update(table.group)
			.set({ karma: group.karma + amount })
			.where(eq(table.group.username, username))
			.returning();
		return updatedGroups[0].karma;
	}

	const updatedUsers = await db
		.update(table.user)
		.set({ karma: user.karma + amount })
		.where(eq(table.user.username, username))
		.returning();
	return updatedUsers[0].karma;
}
