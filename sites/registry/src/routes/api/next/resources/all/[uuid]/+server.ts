import { db } from "$lib/server/db/index.js";
import * as table from "$lib/db/schema.js";
import { json } from "@sveltejs/kit";
import { eq, and } from "drizzle-orm";
import { censorPack } from "$lib/pack.js";
import { isUserMemberOfGroup } from "$lib/server/db/group.js";

// FIXME: This could also quickly explode in size.
export async function GET(event) {
	const clientUser = event.locals.user;

	const { uuid } = event.params;

	let resources = await db
		.select()
		.from(table.resource)
		.fullJoin(table.pack, eq(table.pack.id, table.resource.packId))
		.where(and(eq(table.resource.uuid, uuid)));
	if (resources.length <= 0) {
		return json({ message: "Resource not found." }, { status: 404 });
	}

	const latest = resources.find((r) => r.resource?.isLatestVersion)!;
	if (!latest.pack || !latest.resource) {
		return json({ message: "Resource object is invalid for some reason." }, { status: 500 });
	}

	if (
		!latest.resource.approved &&
		!(await isUserMemberOfGroup(clientUser, clientUser?.username, latest.pack.ownerName))
	) {
		resources = resources.filter((r) => r.resource?.approved);
	}

	return json({
		latest: {
			resource: latest.resource,
			pack: censorPack(latest.pack!, clientUser),
		},
		outdated: resources
			.filter((r) => r.pack?.id !== latest.pack?.id)
			.map((r) => ({
				resource: r.resource,
				pack: censorPack(r.pack!, clientUser),
			})),
	});
}
