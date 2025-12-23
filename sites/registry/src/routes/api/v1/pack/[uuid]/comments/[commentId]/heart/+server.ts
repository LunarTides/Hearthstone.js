import { db } from "$lib/server/db/index.js";
import { pack, packComment } from "$lib/db/schema.js";
import { json } from "@sveltejs/kit";
import { eq, and } from "drizzle-orm";
import { satisfiesRole } from "$lib/user.js";
import type { RequestEvent } from "./$types.js";
import type { ClientUser } from "$lib/server/auth.js";

async function setup(event: RequestEvent, clientUser: NonNullable<ClientUser>) {
	const uuid = event.params.uuid;
	const p = (
		await db
			.select()
			.from(pack)
			.where(and(eq(pack.uuid, uuid), eq(pack.isLatestVersion, true)))
			.limit(1)
	).at(0);
	if (!p) {
		return json({ message: "Version not found." }, { status: 404 });
	}

	if (!p.approved) {
		// eslint-disable-next-line no-empty
		if (p.userIds.includes(clientUser.id) || satisfiesRole(clientUser, "Moderator")) {
		} else {
			return json({ message: "Version not found." }, { status: 404 });
		}
	}

	const commentId = event.params.commentId;
	const c = (await db.select().from(packComment).where(eq(packComment.id, commentId)).limit(1)).at(
		0,
	);
	if (!c) {
		return json({ message: "No comment found with that id." }, { status: 404 });
	}

	return c;
}

// TODO: Deduplicate.
export async function POST(event) {
	const clientUser = event.locals.user;
	if (!clientUser) {
		return json({ message: "Please log in." }, { status: 401 });
	}

	const c = await setup(event, clientUser);
	if (c instanceof Response) {
		return c;
	}

	if (c.heartedById) {
		return json({ message: "This comment has already been hearted." }, { status: 422 });
	}

	await db
		.update(packComment)
		.set({
			heartedById: clientUser.id,
		})
		.where(eq(packComment.id, c.id));

	return json({}, { status: 200 });
}

export async function DELETE(event) {
	const clientUser = event.locals.user;
	if (!clientUser) {
		return json({ message: "Please log in." }, { status: 401 });
	}

	const c = await setup(event, clientUser);
	if (c instanceof Response) {
		return c;
	}

	if (!c.heartedById) {
		return json({ message: "This comment has not been hearted." }, { status: 422 });
	}

	await db
		.update(packComment)
		.set({
			heartedById: null,
		})
		.where(eq(packComment.id, c.id));

	return json({}, { status: 200 });
}
