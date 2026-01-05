import { superValidate } from "sveltekit-superforms";
import { zod4 } from "sveltekit-superforms/adapters";
import { loginSchema } from "$lib/api/schemas";
import { json } from "@sveltejs/kit";
import { verify } from "@node-rs/argon2";
import { db } from "$lib/server/db";
import { user } from "$lib/db/schema";
import * as auth from "$lib/server/auth";
import { eq } from "drizzle-orm";

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

	const results = await db.select().from(user).where(eq(user.username, username));

	const existingUser = results.at(0);
	if (!existingUser) {
		return json({ message: "Incorrect username or password" }, { status: 403 });
	}

	const validPassword = await verify(existingUser.passwordHash, password, {
		memoryCost: 19456,
		timeCost: 2,
		outputLen: 32,
		parallelism: 1,
	});
	if (!validPassword) {
		return json({ message: "Incorrect username or password" }, { status: 403 });
	}

	const sessionToken = auth.generateSessionToken();
	const session = await auth.createSession(sessionToken, existingUser.id);
	auth.setSessionTokenCookie(event, sessionToken, session.expiresAt);

	return json({}, { status: 200 });
}
