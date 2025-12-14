import { profile, user } from "$lib/db/schema";
import { m } from "$lib/paraglide/messages.js";
import { db } from "$lib/server/db";
import { censorUser } from "$lib/user.js";
import { json } from "@sveltejs/kit";
import { eq } from "drizzle-orm";

export async function GET(event) {
	const uuid = event.params.uuid;

	const users = await db
		.select()
		.from(user)
		.where(eq(user.id, uuid))
		.innerJoin(profile, eq(profile.userId, user.id));
	if (users.length <= 0) {
		return json({ message: m.card_not_found() }, { status: 404 });
	}

	const u = users[0];

	return json(
		{
			profile: u.profile,
			...censorUser(u.user),
		},
		{ status: 200 },
	);
}
