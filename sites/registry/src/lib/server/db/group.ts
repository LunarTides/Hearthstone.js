import * as table from "$lib/db/schema.js";
import { db } from "$lib/server/db/index.js";
import { eq, and, count } from "drizzle-orm";
import type { PgSelect } from "drizzle-orm/pg-core";
import type { ClientUser } from "../auth";
import { censorGroup } from "$lib/group";
import { censorUser, RoleTable, satisfiesRole } from "$lib/user";

export const getFullGroups = async <T extends PgSelect<"group">>(
	clientUser: ClientUser | null,
	query: T,
) => {
	const groupsQuery = await query
		.fullJoin(table.groupMember, eq(table.groupMember.groupName, table.group.username))
		.fullJoin(table.user, eq(table.user.username, table.groupMember.username));

	const groups = await Promise.all(
		groupsQuery.map(async (group) => {
			// const relevantGroups = groups.filter((g) => g.group!.username === group.group!.username);

			return {
				...censorGroup(group.group, clientUser),
				members: {
					...group.groupMember,
					user: group.user ? censorUser(group.user, clientUser) : null,
				},
			};
		}),
	);

	return groups;
};

export async function isUserMemberOfGroup<T extends keyof typeof RoleTable>(
	clientUser: ClientUser,
	username: string | undefined,
	groupName: string | undefined,
	minimumBypassRole?: T | undefined,
) {
	if (!groupName || !clientUser) {
		return false;
	}

	if (groupName === username || satisfiesRole(clientUser, minimumBypassRole ?? "Moderator")) {
		return true;
	}

	// No group specified.
	if (!username) {
		return false;
	}

	let isInGroup = false;
	const result = (
		await db
			.select({ value: count() })
			.from(table.groupMember)
			.where(
				and(
					eq(table.groupMember.groupName, groupName),
					eq(table.groupMember.username, username),
					eq(table.groupMember.accepted, true),
				),
			)
			.limit(1)
	)[0];
	isInGroup = result.value > 0;

	return isInGroup;
}
