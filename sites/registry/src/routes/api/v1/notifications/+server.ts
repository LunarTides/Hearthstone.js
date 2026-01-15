import * as table from "$lib/db/schema";
import { db } from "$lib/server/db/index.js";
import { getSetting } from "$lib/server/db/setting";
import { json } from "@sveltejs/kit";
import { desc, eq } from "drizzle-orm";

export async function GET(event) {
	const clientUser = event.locals.user;
	if (!clientUser) {
		return json({ message: "Please log in." }, { status: 401 });
	}

	// TODO: Extract page logic.
	const page = parseInt(event.url.searchParams.get("page") || "1");
	if (Number.isNaN(page) || page <= 0) {
		return json({ message: "Please specify a valid page." }, { status: 400 });
	}

	const pageSize = (await getSetting("api.pageSize")) as number;

	const notifications = await db
		.select()
		.from(table.notification)
		.where(eq(table.notification.userId, clientUser.id))
		.orderBy(desc(table.notification.date))
		.limit(pageSize)
		.offset((page - 1) * pageSize);

	return json({ notifications }, { status: 200 });
}
