/**
 * Importing this module will reach out to an api and save the result to a file.
 * @module Vanilla Card Generator
 */

import { Buffer } from "node:buffer";
import https from "node:https";
import process from "node:process";
import { createGame } from "@Core/game.js";
import type { VanillaCard } from "@Game/types.js";

const API_URL = "https://api.hearthstonejson.com/v1/latest/enUS/cards.json";

const filterAwayUseless = process.argv[2] !== "--no-filter";

const { game } = createGame();

// Function to fetch data from the API
// biome-ignore lint/suspicious/noExplicitAny: <explanation>
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
async function main(): Promise<void> {
	await fetchData(API_URL).then((r) => {
		let data = r as VanillaCard[];
		const oldLength = data.length;

		if (filterAwayUseless) {
			data = game.functions.card.vanilla.filter(data, false, false, true);
		}

		game.functions.util.fs("write", "/vanillacards.json", JSON.stringify(data));

		const difference = oldLength - data.length;
		console.log(
			"Found %s cards!\nFiltered away %s cards!\nSuccessfully imported %s cards!",
			oldLength,
			difference,
			data.length,
		);

		process.exit(0);
	});
}

await main();
