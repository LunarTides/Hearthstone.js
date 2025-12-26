import { superValidate } from "sveltekit-superforms";
import { zod4 } from "sveltekit-superforms/adapters";
import { loginSchema } from "$lib/api/schemas";
import { json } from "@sveltejs/kit";
import { randomUUID } from "crypto";
import { hash } from "@node-rs/argon2";
import { db } from "$lib/server/db";
import { profile, user } from "$lib/db/schema";
import * as auth from "$lib/server/auth";

export async function POST(event) {
	const j = await event.request.json();

	const form = await superValidate(j, zod4(loginSchema));
	if (!form.valid) {
		return json(
			{ message: `Invalid request. (${form.errors._errors?.join(", ")})` },
			{ status: 422 },
		);
	}

	const username = form.data.username;
	const password = form.data.password;

	const userId = randomUUID();
	const passwordHash = await hash(password, {
		// recommended minimum parameters
		memoryCost: 19456,
		timeCost: 2,
		outputLen: 32,
		parallelism: 1,
	});

	try {
		await db.insert(user).values({ id: userId, username, passwordHash });

		const sessionToken = auth.generateSessionToken();
		const session = await auth.createSession(sessionToken, userId);
		auth.setSessionTokenCookie(event, sessionToken, session.expiresAt);

		await db.insert(profile).values({ userId, aboutMe: "" });
	} catch {
		return json({ message: "An error has occurred" }, { status: 500 });
	}

	// TODO: Return link to user.
	return json({}, { status: 201 });
}
