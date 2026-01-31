import { superValidate } from "sveltekit-superforms";
import { zod4 } from "sveltekit-superforms/adapters";
import schema from "$lib/../routes/@[username]/members/new/schema";
import { json } from "@sveltejs/kit";
import { db } from "$lib/server/db";
import * as table from "$lib/db/schema";
import { count, eq, and, ilike } from "drizzle-orm";
import { memberHasPermission } from "$lib/group.js";
import { resolve } from "$app/paths";

export async function POST(event) {
	const clientUser = event.locals.user;
	if (!clientUser) {
		return json({ message: "Please log in." }, { status: 401 });
	}

	const j = await event.request.json();

	const form = await superValidate(j, zod4(schema));
	if (!form.valid) {
		return json(
			// FIXME: This doesn't handle errors relating to `name`. Fix this everywhere.
			{ message: `Invalid request. (${form.errors._errors?.join(", ")})` },
			{ status: 422 },
		);
	}

	const { groupName } = event.params;
	const { username } = form.data;

	const clientMember = (
		await db
			.select({ permissions: table.groupMember.permissions })
			.from(table.groupMember)
			.where(
				and(
					eq(table.groupMember.groupName, groupName),
					eq(table.groupMember.username, clientUser.username),
				),
			)
	).at(0);
	if (!clientMember || !memberHasPermission(clientMember.permissions, "member.add")) {
		return json(
			{ message: "You don't have permission to invite members to this group." },
			{ status: 403 },
		);
	}

	const user = (
		await db.select({ count: count() }).from(table.user).where(eq(table.user.username, username))
	).at(0);
	if (!user?.count) {
		return json({ message: "This user doesn't exist." }, { status: 404 });
	}

	const existingMember = await db
		.select({ count: count() })
		.from(table.groupMember)
		.where(
			and(eq(table.groupMember.groupName, groupName), eq(table.groupMember.username, username)),
		);
	if (existingMember[0].count > 0) {
		return json({ message: "This user has already been invited." }, { status: 403 });
	}

	// TODO: Put other db requests in try-catch blocks in other API endpoints.
	try {
		await db.insert(table.groupMember).values({
			groupName,
			username,
			permissions: [],
			accepted: false,
		});

		await db.insert(table.notification).values({
			username,
			text: `You've been invited to the group '${groupName}'.`,
			route: resolve("/@[username]/members/@[member]", { username: groupName, member: username }),
		});
	} catch {
		return json({ message: "An error has occurred" }, { status: 500 });
	}

	// TODO: Return link to member.
	return json({}, { status: 201 });
}
