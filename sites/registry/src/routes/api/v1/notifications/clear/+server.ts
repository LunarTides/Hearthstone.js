import * as table from "$lib/db/schema";
import { db } from "$lib/server/db/index.js";
import { json } from "@sveltejs/kit";
import { eq } from "drizzle-orm";

export async function POST(event) {
	const clientUser = event.locals.user;
	if (!clientUser) {
		return json({ message: "Please log in." }, { status: 401 });
	}

	const notifications = await db
		.delete(table.notification)
		.where(eq(table.notification.userId, clientUser.id));

	return json({ notifications }, { status: 200 });
}
