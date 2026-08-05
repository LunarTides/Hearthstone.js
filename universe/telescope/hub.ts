import * as hub from "../../hub.ts";
import type { Universe } from "./lib.ts";
import * as lib from "./lib.ts";

let invalidateCache = false;

export async function takeover() {
	await game.prompt.createUILoop(
		{
			message: `[universe/telescope] v${lib.TELESCOPE_VERSION}`,
			callbackBefore: async () => {
				hub.watermark();

				await status();
				console.log();
				console.log("Ad astra.");
				console.log();
			},
		},
		async () => [
			{
				tab: {
					index: 1,
					name: "[telescope]",
				},
				items: [
					{
						name: "Discover and Map",
						onSelect: async () => {
							invalidateCache = true;

							await lib.discover();
							console.log();
							await game.pause();
							return true;
						},
					},
				],
			},
		],
	);
}

async function status() {
	let universe: Universe | undefined;
	let mapSize: number = 0;

	if (await game.fs.call("exists", "/universe/universe.json")) {
		const universeString = (await game.fs.call(
			"readFile",
			"/universe/universe.json",
			{},
			{ invalidateCache },
		)) as string;

		universe = JSON.parse(universeString);
		invalidateCache = false;

		const stats = await game.fs.call("stat", "/universe/universe.json");
		mapSize = stats.size as number;
	}

	const statusMessage = universe ? `DISCOVERED` : "UNDISCOVERED";
	console.log(`Status: ${statusMessage}`);

	if (universe) {
		// Count
		const universes = 1;
		let galaxies = 1;
		let starClusters = 0;
		let starSystems = 0;
		let planets = 0;
		let moons = 0;

		let bytes = 0;
		let errors = 0;
		let violations = 0;
		let suspiciousness = 0;
		const rejectedMoons: lib.Moon[] = [];

		galaxies = universe.galaxies.length;

		for (const galaxy of universe.galaxies) {
			starClusters += galaxy.starClusters.length;

			for (const starCluster of galaxy.starClusters) {
				starSystems += starCluster.starSystems.length;

				for (const starSystem of starCluster.starSystems) {
					planets += starSystem.planets.length;

					for (const planet of starSystem.planets) {
						moons += planet.moons.length;

						for (const moon of planet.moons) {
							bytes += moon.bytes;
							errors += Object.keys(moon.errors).length;
							violations += Object.keys(moon.violations).length;

							for (const susp of Object.values(moon.violations)) {
								if (typeof susp === "number") {
									suspiciousness += susp;
								} else if (susp === "reject") {
									rejectedMoons.push(moon);
								}
							}
						}
					}
				}
			}
		}

		// First Status Line
		{
			const statusline = [];

			// Universes
			{
				const plural = universes !== 1;
				statusline.push(`${universes} ${plural ? "Universes" : "Universe"}`);
			}
			// Galaxies
			{
				const plural = galaxies !== 1;
				statusline.push(`${galaxies} ${plural ? "Galaxies" : "Galaxy"}`);
			}
			// Star Clusters
			{
				const plural = starClusters !== 1;
				statusline.push(
					`${starClusters} ${plural ? "Star Clusters" : "Star Cluster"}`,
				);
			}
			// Star Clusters
			{
				const plural = starSystems !== 1;
				statusline.push(
					`${starSystems} ${plural ? "Star Systems" : "Star System"}`,
				);
			}
			// Planets
			{
				const plural = planets !== 1;
				statusline.push(`${planets} ${plural ? "Planets" : "Planet"}`);
			}
			// Moons
			{
				const plural = moons !== 1;
				statusline.push(`${moons} ${plural ? "Moons" : "Moon"}`);
			}

			console.log(statusline.join(" | "));
		}

		// Second Status Line
		{
			const statusline = [];

			statusline.push(`Map: ${game.data.formatBytes(mapSize)}`);
			statusline.push(`Resources: ${game.data.formatBytes(bytes)}`);
			statusline.push(`${errors} errors`);
			statusline.push(`${violations} violations`);
			statusline.push(`${suspiciousness} suspiciousness`);

			console.log(statusline.join(" | "));
		}

		if (rejectedMoons.length > 0) {
			console.log();
			console.log(
				`<red>Some of the resources (moons) have caused a 'reject' violation: '${rejectedMoons.map((moon) => moon.name).join("', '")}'</red>`,
			);
			console.log(
				"<red bold>IT IS STRONGLY RECOMMENDED <i>NOT</i> TO PLAY WITH THESE RESOURCES.</red bold>",
			);
		} else {
			if (suspiciousness <= 0) {
				console.log("<green>Pristine.</green>");
			} else {
				console.log("<yellow>Caution.</yellow>");
			}
		}
	}
}
