import * as table from "$lib/db/schema";
import { db } from "$lib/server/db";
import { json } from "@sveltejs/kit";
import { eq } from "drizzle-orm";
import { superValidate } from "sveltekit-superforms";
import { zod4 } from "sveltekit-superforms/adapters";
import { hasGradualPermission } from "$lib/server/auth.js";
import { censorGradualToken } from "$lib/token.js";
import * as auth from "$lib/server/auth";
import { postTokenSchema } from "../../../../@[username]/settings/auth/schema";

export async function GET(event) {
	const clientUser = event.locals.user;
	if (!clientUser) {
		return json({ message: "Please log in." }, { status: 401 });
	}

	if (!hasGradualPermission(event.locals.token?.permissions, "tokens.get")) {
		return json({ message: "This request is outside the scope of this token." }, { status: 403 });
	}

	const username = event.params.username;

	const tokens = await db
		.select()
		.from(table.gradualToken)
		.where(eq(table.gradualToken.username, username))
		.orderBy(table.gradualToken.id);

	return json(
		{
			tokens: tokens.map((token) => censorGradualToken(token, clientUser)),
		},
		{ status: 200 },
	);
}

export async function POST(event) {
	const clientUser = event.locals.user;
	if (!clientUser) {
		return json({ message: "Please log in." }, { status: 401 });
	}

	if (!hasGradualPermission(event.locals.token?.permissions, "tokens.create")) {
		return json({ message: "This request is outside the scope of this token." }, { status: 403 });
	}

	const j = await event.request.json();

	const form = await superValidate(j, zod4(postTokenSchema));
	if (!form.valid) {
		return json(
			// FIXME: This doesn't handle errors relating to `name`. Fix this everywhere.
			{ message: `Invalid request. (${form.errors._errors?.join(", ")})` },
			{ status: 422 },
		);
	}

	const { permissions } = form.data;

	const token = auth.generateGradualToken();
	const gradualToken = await auth.createGradualToken(clientUser.username, token, permissions);

	return json(
		{
			gradualToken: censorGradualToken(gradualToken, clientUser),
			token,
		},
		{ status: 200 },
	);
}
