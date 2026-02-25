import * as table from "$lib/db/schema";
import { hasGradualPermission } from "$lib/server/auth";
import { db } from "$lib/server/db/index.js";
import { json } from "@sveltejs/kit";
import { eq } from "drizzle-orm";

export async function POST(event) {
	const clientUser = event.locals.user;
	if (!clientUser) {
		return json({ message: "Please log in." }, { status: 401 });
	}

	if (!hasGradualPermission(event.locals.token?.permissions, "notifications.clear")) {
		return json({ message: "This request is outside the scope of this token." }, { status: 403 });
	}

	const notifications = await db
		.delete(table.notification)
		.where(eq(table.notification.username, clientUser.username));

	return json({ notifications }, { status: 200 });
}
