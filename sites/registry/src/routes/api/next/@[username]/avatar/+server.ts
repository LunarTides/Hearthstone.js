import { json } from "@sveltejs/kit";
import fs from "node:fs/promises";
import { fileTypeFromBuffer } from "file-type";
import { join } from "path";
import { tmpdir } from "os";
import { db } from "$lib/server/db/index.js";
import * as table from "$lib/db/schema.js";
import { eq, and, count } from "drizzle-orm";
import { getCategorySettings } from "$lib/server/db/setting.js";
import { memberHasPermission } from "$lib/group.js";
import { hasGradualPermission } from "$lib/server/auth";
import { createReadStream, createWriteStream } from "node:fs";
import { FFmpeggy } from "ffmpeggy";
import "$lib/server/ffmpeg.js";
import { cwd } from "node:process";
import { resolve } from "node:path";

export async function POST(event) {
	const user = event.locals.user;
	if (!user) {
		return json({ message: "Please log in." }, { status: 401 });
	}

	const username = event.params.username;

	if (username !== user.username) {
		const result = await db
			.select()
			.from(table.group)
			.innerJoin(
				table.groupMember,
				and(
					eq(table.groupMember.groupName, table.group.username),
					eq(table.groupMember.username, user.username),
				),
			)
			.where(eq(table.group.username, username))
			.limit(1);
		if (result.length <= 0) {
			return json(
				{ message: "You do not have permission to change this user's avatar." },
				{ status: 403 },
			);
		}

		const { groupMember } = result[0];
		if (memberHasPermission(groupMember.permissions, `groups.@${username}.edit.avatar`)) {
			// The user can upload on behalf of that group.
		} else {
			return json(
				{ message: "You do not have permission to change this user's avatar." },
				{ status: 403 },
			);
		}
	}

	const existingUsers = await db
		.select({ count: count() })
		.from(table.user)
		.where(eq(table.user.username, username))
		.limit(1);
	if (existingUsers[0].count > 0) {
		if (!hasGradualPermission(event.locals.token?.permissions, `user.edit.avatar`)) {
			return json({ message: "This request is outside the scope of this token." }, { status: 403 });
		}
	} else {
		const existingGroups = await db
			.select({ count: count() })
			.from(table.group)
			.where(eq(table.group.username, username))
			.limit(1);

		if (existingGroups[0].count > 0) {
			if (
				!hasGradualPermission(event.locals.token?.permissions, `groups.@${username}.edit.avatar`)
			) {
				return json(
					{ message: "This request is outside the scope of this token." },
					{ status: 403 },
				);
			}
		}
	}

	const fileBytes = await event.request.arrayBuffer();
	const file = new File([fileBytes], `${username}`);

	const settings = await getCategorySettings({
		user: ["avatarMaxFileSizeRaw", "avatarQuality", "avatarSize"],
	});
	if (file.size > settings.user.avatarMaxFileSizeRaw) {
		return json({ message: "Upload too large." }, { status: 413 });
	}

	const bytes = await file.bytes();

	const ft = await fileTypeFromBuffer(bytes);
	if (ft === undefined || !ft.mime.startsWith("image/")) {
		return json({ message: "Invalid file type." }, { status: 415 });
	}

	const tmpPath = await fs.mkdtemp(join(tmpdir(), "avatar-"));
	await fs.writeFile(`${tmpPath}/${file.name}`, bytes);

	const finalPath = resolve(cwd(), `./static/avatars/${username}.avif`);

	try {
		const ffmpeg = new FFmpeggy({
			input: `${tmpPath}/${file.name}`,
			output: finalPath,
			outputOptions: [
				"-c:v libaom-av1",
				"-still-picture 1",
				`-vf scale=${settings.user.avatarSize}:${settings.user.avatarSize}`,
				`-crf ${settings.user.avatarQuality}`,
			],
			overwriteExisting: true,
			autorun: true,
		});

		await ffmpeg.done();
	} catch (error) {
		console.error(error);
		return json({ message: "Could not compress file." }, { status: 500 });
	}

	const url = new URL(event.request.url);
	event.setHeaders({
		Location: `${url.origin}registry/static/avatars/${username}.avif`,
	});
	return json({}, { status: 201 });
}
