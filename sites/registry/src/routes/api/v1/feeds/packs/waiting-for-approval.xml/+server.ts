import { resolve } from "$app/paths";
import { pack } from "$lib/db/schema.js";
import { db } from "$lib/server/db/index.js";
import { satisfiesRole } from "$lib/user.js";
import { json } from "@sveltejs/kit";
import { eq } from "drizzle-orm";

export async function GET(event) {
	const clientUser = event.locals.user;
	if (!clientUser) {
		return json({ message: "Please log in." }, { status: 401 });
	}

	if (!satisfiesRole(clientUser, "Moderator")) {
		return json(
			{ message: "You do not have the the necessary privileges to view this RSS feed." },
			{ status: 403 },
		);
	}

	const packs = await db.select().from(pack).where(eq(pack.approved, false));

	const xml = `<?xml version="1.0" encoding="utf-8"?>
    <rss version="2.0">

    <channel>
        <title>Regsitry > Packs > Uploaded</title>
        <link>${event.url}</link>
        <description>Newly uploaded packs waiting for moderator approval.</description>
        <updated>${new Date().toISOString()}</updated>
        ${packs.map(
					(p) => `        <item>
            <title>${p.name} v${p.packVersion}</title>
            <link>${resolve("/pack/[uuid]/versions/[version]", { uuid: p.uuid, version: p.packVersion })}</link>
            <uuid>${p.uuid}</uuid>
            <guid>${p.id}</guid>
            <description>${p.description}</description>
            <versions>
                <game>${p.gameVersion}</game>
                <pack>${p.packVersion}</pack>
            </versions>
            <size>${p.unpackedSize}</size>
            <date>${p.createdAt}</date>
            <userids>${p.userIds.join(", ")}</userids>
        </item>`,
				)}
    </channel>

    </rss>`;

	return new Response(xml, {
		headers: {
			"Content-Type": "application/xml",
		},
	});
}
