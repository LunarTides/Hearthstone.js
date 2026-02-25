import * as table from "$lib/db/schema";
import { hasGradualPermission } from "$lib/server/auth";
import { db } from "$lib/server/db/index.js";
import { satisfiesRole } from "$lib/user.js";
import { json } from "@sveltejs/kit";

export async function GET(event) {
	const clientUser = event.locals.user;
	if (!clientUser) {
		return json({ message: "Please log in." }, { status: 401 });
	}

	if (!satisfiesRole(clientUser, "Admin")) {
		return json(
			{ message: "You do not have the the necessary privileges to do this." },
			{ status: 403 },
		);
	}

	if (!hasGradualPermission(event.locals.token?.permissions, "moderation.settings.get")) {
		return json({ message: "This request is outside the scope of this token." }, { status: 403 });
	}

	const settings = await db.select().from(table.setting);
	return json({ settings }, { status: 200 });
}

export async function POST(event) {
	const clientUser = event.locals.user;
	if (!clientUser) {
		return json({ message: "Please log in." }, { status: 401 });
	}

	if (!satisfiesRole(clientUser, "Admin")) {
		return json(
			{ message: "You do not have the the necessary privileges to do this." },
			{ status: 403 },
		);
	}

	if (!hasGradualPermission(event.locals.token?.permissions, "moderation.settings.change")) {
		return json({ message: "This request is outside the scope of this token." }, { status: 403 });
	}

	const raw = await event.request.json();
	if (!raw.settings) {
		return json({ message: "Invalid settings object." }, { status: 400 });
	}

	await db.delete(table.setting);
	await db.insert(table.setting).values(raw.settings);
	return json({ settings: raw.settings }, { status: 200 });
}
