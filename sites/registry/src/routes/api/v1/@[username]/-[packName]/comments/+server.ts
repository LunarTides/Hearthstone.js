import { db } from "$lib/server/db/index.js";
import * as table from "$lib/db/schema.js";
import { json } from "@sveltejs/kit";
import { eq, and, count } from "drizzle-orm";
import { getFullPackComment } from "$lib/server/db/comment.js";
import { CommentRequest } from "$lib/api/types";
import { getSetting } from "$lib/server/db/setting";
import { isUserMemberOfPack } from "$lib/server/db/pack.js";

export async function GET(event) {
	// TODO: Extract page logic.
	const page = parseInt(event.url.searchParams.get("page") || "1");
	if (Number.isNaN(page) || page <= 0) {
		return json({ message: "Please specify a valid page." }, { status: 400 });
	}

	const clientUser = event.locals.user;

	const username = event.params.username;
	const packName = event.params.packName;

	const packs = await db
		.select()
		.from(table.pack)
		.where(and(eq(table.pack.ownerName, username), eq(table.pack.name, packName)));
	if (packs.length <= 0) {
		return json({ message: "Version not found." }, { status: 404 });
	}

	const pack = packs.find((p) => p.isLatestVersion) ?? packs[0];
	if (!pack.approved && !isUserMemberOfPack(clientUser, username, pack)) {
		return json({ message: "Version not found." }, { status: 404 });
	}

	const pageSize = (await getSetting("api.pageSize")) as number;

	const comments = await getFullPackComment(
		clientUser,
		db
			.select()
			.from(table.packComment)
			.where(
				and(
					eq(table.packComment.packOwnerName, pack.ownerName),
					eq(table.packComment.packName, pack.name),
				),
			)
			.limit(pageSize)
			.offset((page - 1) * pageSize)
			.$dynamic(),
	);

	const amount = await db
		.select({ count: count() })
		.from(table.packComment)
		.where(
			and(
				eq(table.packComment.packOwnerName, pack.ownerName),
				eq(table.packComment.packName, pack.name),
			),
		);

	return json(comments, {
		headers: {
			"X-Comment-Amount": amount[0].count.toString(),
		},
	});
}

export async function POST(event) {
	const clientUser = event.locals.user;
	if (!clientUser) {
		return json({ message: "Please log in." }, { status: 401 });
	}

	const username = event.params.username;
	const packName = event.params.packName;

	const packs = await db
		.select()
		.from(table.pack)
		.where(and(eq(table.pack.ownerName, username), eq(table.pack.name, packName)));
	if (packs.length <= 0) {
		return json({ message: "Version not found." }, { status: 404 });
	}

	const pack = packs.find((p) => p.isLatestVersion) ?? packs[0];
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
		packOwnerName: pack.ownerName,
		packName: pack.name,
		username: clientUser.username,
		text: result.data.text,
	});

	return json({}, { status: 200 });
}
