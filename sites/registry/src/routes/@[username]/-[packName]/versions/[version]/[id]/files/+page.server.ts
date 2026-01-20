import { resolve } from "$app/paths";
import { redirect } from "@sveltejs/kit";

export const load = async (event) => {
	const { username, packName, version, id } = event.params;

	redirect(
		301,
		resolve("/@[username]/-[packName]/versions/[version]/[id]", {
			username,
			packName,
			version,
			id,
		}),
	);
};
