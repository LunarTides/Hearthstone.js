import { setting } from "$lib/db/schema";
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

	const settings = await db.select().from(setting);
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

	const raw = await event.request.json();
	if (!raw.settings) {
		return json({ message: "Invalid settings object." }, { status: 400 });
	}

	await db.delete(setting);
	await db.insert(setting).values(raw.settings);
	return json({ settings: raw.settings }, { status: 200 });
}
