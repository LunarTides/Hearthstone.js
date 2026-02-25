import type { RequestEvent } from "@sveltejs/kit";
import { eq } from "drizzle-orm";
import { sha256 } from "@oslojs/crypto/sha2";
import { encodeBase64url, encodeHexLowerCase } from "@oslojs/encoding";
import { db } from "$lib/server/db";
import * as table from "$lib/db/schema";
import { hash } from "@node-rs/argon2";

const DAY_IN_MS = 1000 * 60 * 60 * 24;

export const sessionCookieName = "auth-session";

export function generateSessionToken() {
	const bytes = crypto.getRandomValues(new Uint8Array(18));
	const token = encodeBase64url(bytes);
	return token;
}

export async function createSession(token: string, username: string) {
	const sessionId = encodeHexLowerCase(sha256(new TextEncoder().encode(token)));
	const session: table.Session = {
		id: sessionId,
		username,
		expiresAt: new Date(Date.now() + DAY_IN_MS * 30),
	};
	await db.insert(table.session).values(session);
	return session;
}

export async function validateSessionToken(token: string) {
	const sessionId = encodeHexLowerCase(sha256(new TextEncoder().encode(token)));
	const [result] = await db
		.select({
			// Adjust user table here to tweak returned data
			user: { username: table.user.username, role: table.user.role },
			session: table.session,
		})
		.from(table.session)
		.innerJoin(table.user, eq(table.session.username, table.user.username))
		.where(eq(table.session.id, sessionId));

	if (!result) {
		return { session: null, user: null };
	}
	const { session, user } = result;

	const sessionExpired = Date.now() >= session.expiresAt.getTime();
	if (sessionExpired) {
		await db.delete(table.session).where(eq(table.session.id, session.id));
		return { session: null, user: null };
	}

	const renewSession = Date.now() >= session.expiresAt.getTime() - DAY_IN_MS * 15;
	if (renewSession) {
		session.expiresAt = new Date(Date.now() + DAY_IN_MS * 30);
		await db
			.update(table.session)
			.set({ expiresAt: session.expiresAt })
			.where(eq(table.session.id, session.id));
	}

	return { session, user };
}

export type SessionValidationResult = Awaited<ReturnType<typeof validateSessionToken>>;
export type ClientUser = SessionValidationResult["user"];

export async function invalidateSession(sessionId: string) {
	await db.delete(table.session).where(eq(table.session.id, sessionId));
}

export function setSessionTokenCookie(event: RequestEvent, token: string, expiresAt: Date) {
	event.cookies.set(sessionCookieName, token, {
		expires: expiresAt,
		path: "/",
	});
}

export function deleteSessionTokenCookie(event: RequestEvent) {
	event.cookies.delete(sessionCookieName, {
		path: "/",
	});
}

// Gradual Tokens
export function generateGradualToken() {
	const bytes = crypto.getRandomValues(new Uint8Array(64));
	const token = encodeBase64url(bytes);
	return token;
}

export async function createGradualToken(username: string, token: string, permissions: string[]) {
	const tokenHash = encodeHexLowerCase(sha256(new TextEncoder().encode(token)));
	const gradualToken: table.GradualToken = {
		id: Bun.randomUUIDv7(),
		hashedToken: tokenHash,
		username,
		permissions,
	};

	await db.insert(table.gradualToken).values(gradualToken);
	return gradualToken;
}

export async function validateGradualToken(token: string) {
	const tokenHash = encodeHexLowerCase(sha256(new TextEncoder().encode(token)));
	const [result] = await db
		.select({
			// Adjust user table here to tweak returned data
			user: { username: table.user.username, role: table.user.role },
			gradualToken: table.gradualToken,
		})
		.from(table.gradualToken)
		.innerJoin(table.user, eq(table.gradualToken.username, table.user.username))
		.where(eq(table.gradualToken.hashedToken, tokenHash));

	if (!result) {
		return { token: null, user: null };
	}

	const { gradualToken, user } = result;

	return { token: gradualToken, user };
}

export type GradualTokenValidationResult = Awaited<ReturnType<typeof validateGradualToken>>;

export async function invalidateGradualToken(tokenId: string) {
	await db.delete(table.gradualToken).where(eq(table.gradualToken.id, tokenId));
}

export function hasGradualPermission(permissions: string[] | undefined, permission: string) {
	if (permissions === undefined) {
		// Gradual permissions aren't used.
		// Therefore, treat the user as having all permissions.
		return true;
	}

	if (permission === "*") {
		return true;
	}

	// TODO: Account for `group.*`

	return permissions.includes(permission);
}
