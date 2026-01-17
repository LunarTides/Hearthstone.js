import { resolve } from "$app/paths";
import * as table from "$lib/db/schema.js";
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

	const packs = await db.select().from(table.pack).where(eq(table.pack.approved, false));

	const xml = `<?xml version="1.0" encoding="utf-8"?>
    <rss version="2.0">

    <channel>
        <title>Regsitry > Packs > Uploaded</title>
        <link>${event.url}</link>
        <description>Newly uploaded packs waiting for moderator approval.</description>
        <updated>${new Date().toISOString()}</updated>
        ${packs.map(
					(pack) => `        <item>
            <title>${pack.name} v${pack.packVersion}</title>
            <link>${resolve("/pack/[uuid]/versions/[version]/[id]", { uuid: pack.uuid, version: pack.packVersion, id: pack.id })}</link>
            <uuid>${pack.uuid}</uuid>
            <guid>${pack.id}</guid>
            <description>${pack.description}</description>
            <versions>
                <game>${pack.gameVersion}</game>
                <pack>${pack.packVersion}</pack>
            </versions>
            <size>${pack.unpackedSize}</size>
            <date>${pack.createdAt}</date>
            <owner>${pack.ownerName}</owner>
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
