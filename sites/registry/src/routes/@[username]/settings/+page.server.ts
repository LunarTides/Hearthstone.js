import { resolve } from "$app/paths";
import { redirect } from "@sveltejs/kit";

export const load = async (event) => {
	redirect(302, resolve("/@[username]/settings/account", { username: event.params.username }));
};
