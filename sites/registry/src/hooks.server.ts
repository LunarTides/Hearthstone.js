import { sequence } from "@sveltejs/kit/hooks";
import * as auth from "$lib/server/auth";
import type { Handle } from "@sveltejs/kit";
import { db } from "$lib/server/db";
import * as table from "$lib/db/schema";
import { count } from "drizzle-orm";
import { generateDefaultSettings } from "$lib/server/db/setting";

const handleAuth: Handle = async ({ event, resolve }) => {
	const sessionToken = event.cookies.get(auth.sessionCookieName);

	if (!sessionToken) {
		event.locals.user = null;
		event.locals.session = null;
		return resolve(event);
	}

	const { session, user } = await auth.validateSessionToken(sessionToken);

	if (session) {
		auth.setSessionTokenCookie(event, sessionToken, session.expiresAt);
	} else {
		auth.deleteSessionTokenCookie(event);
	}

	event.locals.user = user;
	event.locals.session = session;
	return resolve(event);
};

export const handle: Handle = sequence(handleAuth);

export const init = async () => {
	// Setup default settings.
	const amount = await db.select({ value: count(table.setting.key) }).from(table.setting);
	if (amount.length <= 0 || amount[0].value <= 0) {
		await generateDefaultSettings();
	}
};
