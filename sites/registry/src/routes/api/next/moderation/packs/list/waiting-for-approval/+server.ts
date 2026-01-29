import { json } from "@sveltejs/kit";
import { db } from "$lib/server/db";
import * as table from "$lib/db/schema";
import { and, eq } from "drizzle-orm";
import { getFullPacks } from "$lib/server/db/pack";
import { getSetting } from "$lib/server/db/setting";
import { satisfiesRole } from "$lib/user.js";

export async function GET(event) {
	const clientUser = event.locals.user;
	// TODO: Add these checks everywhere that requires authentication.
	if (!clientUser) {
		return json({ message: "Please log in." }, { status: 401 });
	}

	if (!satisfiesRole(clientUser, "Moderator")) {
		return json(
			{ message: "You do not have the the necessary privileges to do this." },
			{ status: 403 },
		);
	}

	const page = parseInt(event.url.searchParams.get("page") || "1");
	if (Number.isNaN(page) || page <= 0) {
		return json({ message: "Please specify a valid page." }, { status: 400 });
	}

	const pageSize = (await getSetting("api.pageSize")) as number;

	const packs = await getFullPacks(
		clientUser,
		db
			.select()
			.from(table.pack)
			.where(and(eq(table.pack.approved, false), eq(table.pack.denied, false)))
			.limit(pageSize)
			.offset((page - 1) * pageSize)
			.$dynamic(),
		false,
	);

	return json(packs);
}
