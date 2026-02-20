import { superValidate } from "sveltekit-superforms";
import { zod4 } from "sveltekit-superforms/adapters";
import schema from "$lib/../routes/@[username]/groups/new/schema";
import { json } from "@sveltejs/kit";
import { db } from "$lib/server/db";
import * as table from "$lib/db/schema";
import { count, ilike } from "drizzle-orm";

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

	const { name } = form.data;

	const existingGroup = await db
		.select({ count: count() })
		.from(table.group)
		.where(ilike(table.group.username, name));
	if (existingGroup[0].count > 0) {
		return json({ message: "This group's name is taken." }, { status: 403 });
	}

	// TODO: Put other db requests in try-catch blocks in other API endpoints.
	try {
		const group = (
			await db
				.insert(table.group)
				.values({ username: name })
				.returning({ name: table.group.username })
		)[0];

		await db.insert(table.groupMember).values({
			groupName: group.name,
			username: clientUser.username,
			permissions: ["owner"],
			accepted: true,
		});

		await db.insert(table.groupProfile).values({ username: group.name, aboutMe: "" });
	} catch {
		return json({ message: "An error has occurred" }, { status: 500 });
	}

	// TODO: Return link to group.
	return json({}, { status: 201 });
}
