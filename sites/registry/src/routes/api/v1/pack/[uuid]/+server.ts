import { db } from "$lib/server/db/index.js";
import { pack } from "$lib/db/schema.js";
import { json } from "@sveltejs/kit";
import { eq } from "drizzle-orm";
import { satisfiesRole } from "$lib/user.js";

// TODO: Deduplicate.
export async function DELETE(event) {
	const user = event.locals.user;
	if (!user) {
		return json({ message: "Please log in." });
	}

	const uuid = event.params.uuid;

	const version = (await db.select().from(pack).where(eq(pack.uuid, uuid))).at(0);
	if (!version) {
		return json({ message: "Version not found." }, { status: 404 });
	}

	if (!version.userIds.includes(user.id) && !satisfiesRole(user, "Moderator")) {
		return json(
			{ message: "You do not have the the necessary privileges to do this." },
			{ status: 403 },
		);
	}

	await db.delete(pack).where(eq(pack.uuid, version.uuid));

	return json({}, { status: 200 });
}
