import { getRequestEvent } from "$app/server";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async () => {
	const user = requireLogin();
	return { user };
};

function requireLogin() {
	const { locals } = getRequestEvent();
	return locals.user;
}
