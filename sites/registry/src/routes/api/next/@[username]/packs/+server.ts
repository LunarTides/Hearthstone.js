import { json } from "@sveltejs/kit";
import type { PackWithExtras } from "$lib/db/schema.js";
import * as table from "$lib/db/schema.js";
import { db } from "$lib/server/db/index.js";
import { getFullPacks } from "$lib/server/db/pack";
import { eq } from "drizzle-orm";

const packSortingFunction = (a: PackWithExtras, b: PackWithExtras) => {
	if (!a.approved && b.approved) {
		return 1;
	} else if (a.approved && !b.approved) {
		return -1;
	}

	return Bun.semver.order(b.packVersion, a.packVersion);
};

// FIXME: The size of the returned json can easily explode in size.
export async function GET(event) {
	const clientUser = event.locals.user;
	const { username } = event.params;

	const packs = await getFullPacks(
		clientUser,
		db.select().from(table.pack).where(eq(table.pack.ownerName, username)).$dynamic(),
		false,
	);
	if (packs.length <= 0) {
		return json([]);
	}

	const packsToReturn = [];

	const uniquePackNames = new Set(packs.map((p) => p.name));
	for (const uniquePackName of uniquePackNames) {
		const versions = packs.filter((p) => p.name === uniquePackName).toSorted(packSortingFunction);
		packsToReturn.push({
			name: uniquePackName,
			versions: {
				latest: versions[0],
				outdated: versions.slice(1),
			},
		});
	}

	packsToReturn.sort((a, b) => {
		const ap = a.versions.latest;
		const bp = b.versions.latest;

		return ap.name.localeCompare(bp.name);
	});

	return json(packsToReturn);
}
