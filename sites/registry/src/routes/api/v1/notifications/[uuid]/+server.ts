import { db } from "$lib/server/db/index.js";
import type { Notification } from "$lib/db/schema.js";
import * as table from "$lib/db/schema.js";
import { json } from "@sveltejs/kit";
import { eq } from "drizzle-orm";

export async function DELETE(event) {
	const clientUser = event.locals.user;
	if (!clientUser) {
		return json({ message: "Please log in." }, { status: 401 });
	}

	const notificationId = event.params.uuid;
	const notifications = await db
		.select()
		.from(table.notification)
		.where(eq(table.notification.id, notificationId));
	if (notifications.length <= 0) {
		return json({ message: "Notification not found." }, { status: 404 });
	}

	const notification: Notification = notifications[0];

	if (notification.userId !== clientUser.id) {
		return json(
			{ message: "You do not have the the necessary privileges to do this." },
			{ status: 403 },
		);
	}

	await db.delete(table.notification).where(eq(table.notification.id, notificationId));

	return json({}, { status: 200 });
}
