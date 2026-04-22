import { createGame } from "@Game/game.ts";
import pathUtils from "node:path";
import type { Resource } from "universe/emergence/create/lib.ts";

// TODO: Remove.
await createGame();

// Root
class Universe {
	galaxies: Galaxy[];

	static async discover(): Promise<Universe> {
		const universe = new Universe();
		universe.galaxies = await Galaxy.discoverAll(universe);
		return universe;
	}

	async export(
		path: string = "/universe/universe.json",
	): Promise<{ json: string; bytes: number }> {
		const seen: any[] = [];

		// Stringify json, ignoring cyclic structures.
		const json = JSON.stringify(
			this,
			(key, val) => {
				if (val != null && typeof val === "object") {
					if (seen.indexOf(val) >= 0) {
						return;
					}
					seen.push(val);
				}
				return val;
			},
			4,
		);

		const bytes = await Bun.write(game.fs.restrictPath(path), json);
		return { json, bytes };
	}
}

// TBD
class Galaxy {
	starClusters: StarCluster[];

	universe: Universe | undefined;

	static async discoverAll(universe?: Universe): Promise<Galaxy[]> {
		const galaxies: Galaxy[] = [];

		const galaxy = new Galaxy();
		galaxy.universe = universe;
		galaxy.starClusters = await StarCluster.discoverAll(galaxy);
		galaxies.push(galaxy);

		return galaxies;
	}
}

// TBD
class StarCluster {
	solarSystems: SolarSystem[];

	galaxy: Galaxy | undefined;

	static async discoverAll(galaxy?: Galaxy): Promise<StarCluster[]> {
		const starClusters: StarCluster[] = [];

		const starCluster = new StarCluster();
		starCluster.galaxy = galaxy;
		starCluster.solarSystems = await SolarSystem.discoverAll(starCluster);
		starClusters.push(starCluster);

		return starClusters;
	}
}

// Packs belonging to a specific author.
class SolarSystem {
	star: Star;
	planets: Planet[];

	starCluster: StarCluster | undefined;

	static async discoverAll(starCluster?: StarCluster): Promise<SolarSystem[]> {
		const solarSystems: SolarSystem[] = [];

		await game.fs.searchFolder(
			"/packs",
			async (index, path, file) => {
				if (
					!file.parentPath.endsWith("packs") ||
					!file.name.startsWith("@") ||
					!file.isDirectory()
				) {
					return;
				}

				// New author.
				const solarSystem = new SolarSystem();
				solarSystem.starCluster = starCluster;

				const star = new Star();
				star.solarSystem = solarSystem;
				await star.scan(path);

				solarSystem.star = star;
				solarSystem.planets = await Planet.discoverAll(solarSystem);
				solarSystems.push(solarSystem);
			},
			false,
		);

		return solarSystems.toSorted((a, b) =>
			a.star.name.localeCompare(b.star.name),
		);
	}
}

// Author Info
class Star {
	name: string;

	solarSystem: SolarSystem | undefined;

	async scan(path: string) {
		this.name = pathUtils.basename(path).slice(1);
	}
}

// Pack
class Planet {
	name: string;
	suspiciousness: number = 0;
	moons: Moon[];

	solarSystem: SolarSystem | undefined;

	/**
	 *
	 * @param solarSystem
	 * @param star If `solarSystem` isn't set, you need to set the star here.
	 * @returns
	 */
	static async discoverAll(
		solarSystem?: SolarSystem,
		star?: Star,
	): Promise<Planet[]> {
		if (!solarSystem && !star) {
			throw new Error(
				"Planet isn't specified a solar system or a star. One of these need to be specified.",
			);
		}

		const authorName = (star ?? solarSystem?.star)?.name as string;

		const planets: Planet[] = [];

		await game.fs.searchFolder(
			`/packs/@${authorName}`,
			async (index, path, file) => {
				if (!file.parentPath.endsWith(authorName) || !file.isDirectory()) {
					return;
				}

				const planet = new Planet();
				planet.solarSystem = solarSystem;
				await planet.scan(path);
				planet.moons = await Moon.discoverAll(planet);
				planets.push(planet);
			},
			false,
		);

		return planets.toSorted((a, b) => a.name.localeCompare(b.name));
	}

	async scan(path: string) {
		this.name = pathUtils.basename(path);
	}
}

// Pack Resource
class Moon {
	name: string;
	type: Resource;

	bytes: number;
	suspiciousness: number = 0;

	planet: Planet;

	/**
	 *
	 * @param planet
	 * @param star If `planet` isn't set, you need to set the star here.
	 * @returns
	 */
	static async discoverAll(planet: Planet, star?: Star): Promise<Moon[]> {
		const authorName = (star ?? planet?.solarSystem?.star)?.name as string;

		const moons: Moon[] = [];

		await game.fs.searchFolder(
			`/packs/@${authorName}/${planet.name}`,
			async (index, path, file, content) => {
				if (!content || !file.isFile() || !file.name.endsWith(".ts")) {
					return;
				}

				const moon = new Moon();
				moon.planet = planet;
				await moon.scan(path);
				moons.push(moon);
			},
		);

		return moons.toSorted((a, b) => a.name.localeCompare(b.name));
	}

	async scan(path: string) {
		this.name = pathUtils.basename(path);

		// Get resource type.
		this.type = (this.name.split(".").slice(1).at(-2) as Resource) || "card";

		const content = (await game.fs.call("readFile", path, "utf8", {
			invalidateCache: true,
		})) as string;
		this.bytes = Buffer.from(content, "utf8").byteLength;
	}
}

const universe = await Universe.discover();
const result = await universe.export();
console.log(result.json);
