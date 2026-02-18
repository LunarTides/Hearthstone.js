import { db } from "$lib/server/db/index.js";
import * as table from "$lib/db/schema.js";
import { json } from "@sveltejs/kit";
import { and, eq } from "drizzle-orm";
import { CommentRequest } from "$lib/api/types";
import { isUserMemberOfPack } from "$lib/server/db/pack.js";

export async function POST(event) {
	const clientUser = event.locals.user;
	if (!clientUser) {
		return json({ message: "Please log in." }, { status: 401 });
	}

	const { username, packName, version } = event.params;

	const pack = (
		await db
			.select()
			.from(table.pack)
			.where(
				and(
					eq(table.pack.ownerName, username),
					eq(table.pack.name, packName),
					eq(table.pack.packVersion, version),
				),
			)
			.limit(1)
	).at(0);
	if (!pack) {
		return json({ message: "Version not found." }, { status: 404 });
	}

	if (!pack.approved && !isUserMemberOfPack(clientUser, username, pack)) {
		return json({ message: "Version not found." }, { status: 404 });
	}

	const result = CommentRequest.safeParse(await event.request.json());
	if (!result.success) {
		return json(
			{ message: `Invalid data provided. ${JSON.parse(result.error.message)[0].message}` },
			{ status: 422 },
		);
	}

	await db.insert(table.packComment).values({
		packId: pack.id,
		username: clientUser.username,
		text: result.data.text,
	});

	return json({}, { status: 200 });
}
