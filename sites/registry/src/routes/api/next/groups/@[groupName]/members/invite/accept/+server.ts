import { superValidate } from "sveltekit-superforms";
import { zod4 } from "sveltekit-superforms/adapters";
import { json } from "@sveltejs/kit";
import { db } from "$lib/server/db";
import * as table from "$lib/db/schema";
import { eq, and } from "drizzle-orm";
import z from "zod";

export async function POST(event) {
	const clientUser = event.locals.user;
	if (!clientUser) {
		return json({ message: "Please log in." }, { status: 401 });
	}

	const j = await event.request.json();

	const form = await superValidate(j, zod4(z.object()));
	if (!form.valid) {
		return json(
			// FIXME: This doesn't handle errors relating to `name`. Fix this everywhere.
			{ message: `Invalid request. (${form.errors._errors?.join(", ")})` },
			{ status: 422 },
		);
	}

	const { groupName } = event.params;

	const clientMember = (
		await db
			.select({ id: table.groupMember.id })
			.from(table.groupMember)
			.where(
				and(
					eq(table.groupMember.groupName, groupName),
					eq(table.groupMember.username, clientUser.username),
				),
			)
	).at(0);
	if (!clientMember) {
		return json({ message: "You don't have an invite to this group." }, { status: 403 });
	}

	// TODO: Put other db requests in try-catch blocks in other API endpoints.
	try {
		await db
			.update(table.groupMember)
			.set({ accepted: true })
			.where(eq(table.groupMember.id, clientMember.id));
	} catch {
		return json({ message: "An error has occurred" }, { status: 500 });
	}

	// TODO: Return link to member.
	return json({}, { status: 201 });
}
