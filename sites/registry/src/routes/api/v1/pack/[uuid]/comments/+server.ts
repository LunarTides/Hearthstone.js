import { db } from "$lib/server/db/index.js";
import { pack, packComment } from "$lib/db/schema.js";
import { json } from "@sveltejs/kit";
import { eq, and, count } from "drizzle-orm";
import { satisfiesRole } from "$lib/user.js";
import { getFullPackComment } from "$lib/server/db/comment.js";
import { CommentRequest } from "$lib/api/types";
import { getSetting } from "$lib/server/db/setting";

export async function GET(event) {
	// TODO: Extract page logic.
	const page = parseInt(event.url.searchParams.get("page") || "1");
	if (Number.isNaN(page) || page <= 0) {
		return json({ message: "Please specify a valid page." }, { status: 400 });
	}

	const clientUser = event.locals.user;

	const uuid = event.params.uuid;
	const packs = await db
		.select()
		.from(pack)
		.where(and(eq(pack.uuid, uuid)));
	if (packs.length <= 0) {
		return json({ message: "Version not found." }, { status: 404 });
	}

	const p = packs.find((p) => p.isLatestVersion) ?? packs[0];
	if (!p.approved) {
		if (
			clientUser &&
			(p.userIds.includes(clientUser.id) || satisfiesRole(clientUser, "Moderator"))
		) {
			// eslint-disable no-empty
		} else {
			return json({ message: "Version not found." }, { status: 404 });
		}
	}

	const pageSize = (await getSetting("api.pageSize")) as number;

	const comments = await getFullPackComment(
		clientUser,
		db
			.select()
			.from(packComment)
			.where(eq(packComment.packId, p.uuid))
			.limit(pageSize)
			.offset((page - 1) * pageSize)
			.$dynamic(),
	);

	const amount = await db
		.select({ count: count() })
		.from(packComment)
		.where(eq(packComment.packId, p.uuid));

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

	const uuid = event.params.uuid;
	const packs = await db.select().from(pack).where(eq(pack.uuid, uuid));
	if (packs.length <= 0) {
		return json({ message: "Version not found." }, { status: 404 });
	}

	const p = packs.find((p) => p.isLatestVersion) ?? packs[0];
	if (!p.approved) {
		if (
			clientUser &&
			(p.userIds.includes(clientUser.id) || satisfiesRole(clientUser, "Moderator"))
		) {
			// eslint-disable no-empty
		} else {
			return json({ message: "Version not found." }, { status: 404 });
		}
	}

	const result = CommentRequest.safeParse(await event.request.json());
	if (!result.success) {
		return json(
			{ message: `Invalid data provided. ${JSON.parse(result.error.message)[0].message}` },
			{ status: 422 },
		);
	}

	await db.insert(packComment).values({
		packId: p.uuid,
		authorId: clientUser.id,
		text: result.data.text,
	});

	return json({}, { status: 200 });
}
