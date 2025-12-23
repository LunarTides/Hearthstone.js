import { hash, verify } from "@node-rs/argon2";
import { fail, redirect } from "@sveltejs/kit";
import { eq } from "drizzle-orm";
import * as auth from "$lib/server/auth";
import { db } from "$lib/server/db";
import * as table from "$lib/db/schema";
import { m } from "$lib/paraglide/messages.js";
import type { Actions, PageServerLoad } from "./$types";
import { randomUUID } from "crypto";
import z from "zod";
import { superValidate, setError } from "sveltekit-superforms";
import { zod4 } from "sveltekit-superforms/adapters";

const schema = z.object({
	username: z
		.string()
		.min(3)
		.max(31)
		.regex(/^[a-zA-Z0-9_-]+$/),
	password: z.string().min(6).max(255),
});

export const load: PageServerLoad = async (event) => {
	// If the user is already logged in, take them to the home menu.
	if (event.locals.user) {
		return redirect(302, "/");
	}

	const form = await superValidate(zod4(schema));

	return { form };
};

export const actions: Actions = {
	login: async (event) => {
		const form = await superValidate(event.request, zod4(schema));
		if (!form.valid) {
			return fail(400, { form });
		}

		const username = form.data.username;
		const password = form.data.password;

		const results = await db.select().from(table.user).where(eq(table.user.username, username));

		const existingUser = results.at(0);
		if (!existingUser) {
			return setError(form, m.incorrect_login());
		}

		const validPassword = await verify(existingUser.passwordHash, password, {
			memoryCost: 19456,
			timeCost: 2,
			outputLen: 32,
			parallelism: 1,
		});
		if (!validPassword) {
			return setError(form, m.incorrect_login());
		}

		const sessionToken = auth.generateSessionToken();
		const session = await auth.createSession(sessionToken, existingUser.id);
		auth.setSessionTokenCookie(event, sessionToken, session.expiresAt);

		return redirect(302, "/");
	},
	register: async (event) => {
		const form = await superValidate(event.request, zod4(schema));
		if (!form.valid) {
			return fail(400, { form });
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
			await db.insert(table.user).values({ id: userId, username, passwordHash });

			const sessionToken = auth.generateSessionToken();
			const session = await auth.createSession(sessionToken, userId);
			auth.setSessionTokenCookie(event, sessionToken, session.expiresAt);

			await db.insert(table.profile).values({ userId, aboutMe: "" });
		} catch {
			return setError(form, m.generic_error(), { status: 500 });
		}

		return redirect(302, "/");
	},
};
