import * as table from "$lib/db/schema.js";
import { eq } from "drizzle-orm";
import type { PgSelect } from "drizzle-orm/pg-core";
import type { ClientUser } from "../auth";
import { censorGroup } from "$lib/group";
import { censorUser } from "$lib/user";

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
