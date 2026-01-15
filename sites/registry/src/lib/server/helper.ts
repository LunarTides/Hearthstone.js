import { db } from "$lib/server/db";
import * as table from "$lib/db/schema";
import type { InferInsertModel } from "drizzle-orm";
import type { RequestEvent } from "@sveltejs/kit";

export async function notify(
	event: RequestEvent,
	values: InferInsertModel<typeof table.notification>,
) {
	await db.insert(table.notification).values({
		...values,
		route:
			values.route &&
			`${event.url.origin}/registry/${values.route.replaceAll("../", "").replaceAll("..", "")}`,
	});
}
