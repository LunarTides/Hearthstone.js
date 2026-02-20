import { db } from "$lib/server/db/index.js";
import { superValidate } from "sveltekit-superforms";
import { zod4 } from "sveltekit-superforms/adapters";
import { postSchema } from "../../../../../../@[username]/-[packName]/v[version]/comments/schema.js";
import * as table from "$lib/db/schema.js";
import { json } from "@sveltejs/kit";
import { and, eq } from "drizzle-orm";
import { isUserMemberOfGroup } from "$lib/server/db/group.js";

export async function POST(event) {
	const clientUser = event.locals.user;
	if (!clientUser) {
		return json({ message: "Please log in." }, { status: 401 });
	}

	const { username, packName, version } = event.params;

	const j = await event.request.json();

	const form = await superValidate(j, zod4(postSchema));
	if (!form.valid) {
		return json(
			// FIXME: This doesn't handle errors relating to `name`. Fix this everywhere.
			{ message: `Invalid request. (${form.errors._errors?.join(", ")})` },
			{ status: 422 },
		);
	}

	const { text, cardUUID } = form.data;

	const pack = (
		await db
			.select()
			.from(table.pack)
			.where(
				and(
					eq(table.pack.ownerName, username),
					eq(table.pack.name, packName),
					eq(table.pack.packVersion, version),
				),
			)
			.limit(1)
	).at(0);
	if (!pack) {
		return json({ message: "Version not found." }, { status: 404 });
	}

	if (!pack.approved && !(await isUserMemberOfGroup(clientUser, clientUser.username, username))) {
		return json({ message: "Version not found." }, { status: 404 });
	}

	await db.insert(table.comment).values({
		packId: pack.id,
		username: clientUser.username,
		text,
		cardUUID,
	});

	return json({}, { status: 200 });
}
