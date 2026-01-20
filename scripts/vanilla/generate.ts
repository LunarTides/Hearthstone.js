/**
 * Importing this module will reach out to an api and save the result to a file.
 */

import { createGame } from "@Game/game.ts";
import type { VanillaCard } from "@Game/types.ts";
import { Buffer } from "node:buffer";
import https from "node:https";
import process from "node:process";

const API_URL = "https://api.hearthstonejson.com/v1/latest/enUS/cards.json";

const filterAwayUseless = process.argv[2] !== "--no-filter";

if (import.meta.main) {
	await createGame(false);
}

// Function to fetch data from the API
function fetchData(url: string): Promise<any> {
	return new Promise((resolve, reject) => {
		https
			.get(url, (response) => {
				// Follow redirects
				if ([301, 302].includes(response.statusCode ?? 500)) {
					return resolve(fetchData(response.headers.location ?? ""));
				}

				const chunks: Uint8Array[] = [];

				response.on("data", (chunk) => chunks.push(chunk));
				response.on("end", () =>
					resolve(JSON.parse(Buffer.concat(chunks).toString())),
				);
			})
			.on("error", reject);
	});
}

/**
 * Reach out to an api and save the result to a file.
 *
 * @returns Promise that resolves to void.
 */
export async function main(): Promise<void> {
	// Do this, otherwise `game` isn't recognized.
	const hub = await import("../../hub.ts");

	if (!game.config.networking.allow.game) {
		console.error(
			"<yellow>Networking access denied. Please enable 'Networking > Allow > Game' to continue. Aborting.</yellow>",
		);
		return;
	}

	hub.watermark(false);

	console.log("Querying API...");

	await fetchData(API_URL).then(async (r) => {
		let data = r as VanillaCard[];
		const oldLength = data.length;

		if (filterAwayUseless) {
			data = game.functions.card.vanilla.filter(data, false, false, true);
		}

		await game.functions.util.fs(
			"writeFile",
			"/vanillacards.json",
			JSON.stringify(data),
		);

		const difference = oldLength - data.length;
		console.log(
			"Found %s cards!\nFiltered away %s cards!\nSuccessfully imported %s cards!",
			oldLength,
			difference,
			data.length,
		);

		if (import.meta.main) {
			process.exit(0);
		} else {
			await game.pause();
		}
	});
}

if (import.meta.main) {
	await main();
}
