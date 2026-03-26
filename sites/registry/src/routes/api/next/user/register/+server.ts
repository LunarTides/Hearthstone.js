import { superValidate } from "sveltekit-superforms";
import { zod4 } from "sveltekit-superforms/adapters";
import schema from "../../../../login/schema";
import { json } from "@sveltejs/kit";
import { hash } from "@node-rs/argon2";
import { db } from "$lib/server/db";
import * as table from "$lib/db/schema";
import * as auth from "$lib/server/auth";
import { count, ilike } from "drizzle-orm";
import { dev } from "$app/environment";
import { env } from "$env/dynamic/private";

export async function POST(event) {
	// TODO: Remove when no longer relevant.
	if (!dev) {
		if (event.cookies.get("Registry-Allow-Signup") !== env.REGISTRY_SIGNUP_BYPASS) {
			return json(
				{
					message:
						"Creating accounts has been disabled. This feature will be enabled when the registry is closer to completion. Sorry about that...",
				},
				{ status: 403 },
			);
		}
	}

	const j = await event.request.json();

	const form = await superValidate(j, zod4(schema));
	if (!form.valid) {
		return json(
			{ message: `Invalid request. (${form.errors._errors?.join(", ")})` },
			{ status: 422 },
		);
	}

	const username = form.data.username;
	const password = form.data.password;

	const existingUser = await db
		.select({ count: count() })
		.from(table.user)
		.where(ilike(table.user.username, username));
	if (existingUser[0].count > 0) {
		return json({ message: "This username is taken." }, { status: 403 });
	}

	const existingGroup = await db
		.select({ count: count() })
		.from(table.group)
		.where(ilike(table.group.username, username));
	if (existingGroup[0].count > 0) {
		return json({ message: "This username is taken." }, { status: 403 });
	}

	const passwordHash = await hash(password, {
		// recommended minimum parameters
		memoryCost: 19456,
		timeCost: 2,
		outputLen: 32,
		parallelism: 1,
	});

	try {
		const user = (
			await db
				.insert(table.user)
				.values({ username, passwordHash })
				.returning({ username: table.user.username })
		)[0];

		const sessionToken = auth.generateSessionToken();
		const session = await auth.createSession(sessionToken, user.username);
		auth.setSessionTokenCookie(event, sessionToken, session.expiresAt);

		await db.insert(table.userProfile).values({ username: user.username, aboutMe: "" });
	} catch {
		return json({ message: "An error has occurred" }, { status: 500 });
	}

	// TODO: Return link to user.
	return json({}, { status: 201 });
}
