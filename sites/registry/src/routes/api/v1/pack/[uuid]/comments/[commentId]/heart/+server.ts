import { db } from "$lib/server/db/index.js";
import * as table from "$lib/db/schema.js";
import { json } from "@sveltejs/kit";
import { eq, and } from "drizzle-orm";
import { satisfiesRole } from "$lib/user.js";
import type { RequestEvent } from "./$types.js";
import type { ClientUser } from "$lib/server/auth.js";
import { resolve } from "$app/paths";
import { notify } from "$lib/server/helper.js";

async function setup(event: RequestEvent, clientUser: NonNullable<ClientUser>) {
	const uuid = event.params.uuid;
	const pack = (
		await db
			.select()
			.from(table.pack)
			.where(and(eq(table.pack.uuid, uuid), eq(table.pack.isLatestVersion, true)))
			.limit(1)
	).at(0);
	if (!pack) {
		return json({ message: "Version not found." }, { status: 404 });
	}

	if (!pack.approved) {
		// eslint-disable-next-line no-empty
		if (pack.userIds.includes(clientUser.id) || satisfiesRole(clientUser, "Moderator")) {
		} else {
			return json({ message: "Version not found." }, { status: 404 });
		}
	}

	const commentId = event.params.commentId;
	const comment = (
		await db.select().from(table.packComment).where(eq(table.packComment.id, commentId)).limit(1)
	).at(0);
	if (!comment) {
		return json({ message: "No comment found with that id." }, { status: 404 });
	}

	return comment;
}

// TODO: Deduplicate.
export async function POST(event) {
	const clientUser = event.locals.user;
	if (!clientUser) {
		return json({ message: "Please log in." }, { status: 401 });
	}

	const comment = await setup(event, clientUser);
	if (comment instanceof Response) {
		return comment;
	}

	if (comment.heartedById) {
		return json({ message: "This comment has already been hearted." }, { status: 422 });
	}

	await db
		.update(table.packComment)
		.set({
			heartedById: clientUser.id,
		})
		.where(eq(table.packComment.id, comment.id));

	if (comment.authorId && comment.authorId !== clientUser.id) {
		await notify(event, {
			userId: comment.authorId,
			text: "Your comment has been hearted!",
			route: resolve("/pack/[uuid]", { uuid: comment.packId }) + `#comment-${comment.id}`,
		});
	}

	return json({}, { status: 200 });
}

export async function DELETE(event) {
	const clientUser = event.locals.user;
	if (!clientUser) {
		return json({ message: "Please log in." }, { status: 401 });
	}

	const comment = await setup(event, clientUser);
	if (comment instanceof Response) {
		return comment;
	}

	if (!comment.heartedById) {
		return json({ message: "This comment has not been hearted." }, { status: 422 });
	}

	await db
		.update(table.packComment)
		.set({
			heartedById: null,
		})
		.where(eq(table.packComment.id, comment.id));

	return json({}, { status: 200 });
}
