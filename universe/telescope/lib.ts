import pathUtils from "node:path";
import {
	type ErrorLabel,
	type ParseResult,
	parseSync,
	Severity,
} from "oxc-parser";
import type { Resource } from "../emergence/create/lib.ts";
import {
	Blueprint,
	Class,
	Command,
	Rarity,
	SFX,
	Tribe,
	Type,
} from "@Game/types.ts";

// TODO: Don't import resources until *after* this tools is run. Otherwise, it's kinda pointless. Oh, no! This resource is suspicious, oh I gotta warn— and they're dead.
export const TELESCOPE_VERSION = "0.1.0";

// Root
export class Universe {
	galaxies: Galaxy[] = [];

	static async discover(): Promise<Universe> {
		const universe = new Universe();
		universe.galaxies = await Galaxy.discoverAll(universe);
		return universe;
	}

	async export(
		path: string = "/universe/universe.json",
	): Promise<{ json: string; bytes: number; path: string }> {
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
		).replaceAll("    ", "\t");

		const bytes = await Bun.write(game.fs.restrictPath(path), json);
		return { json, bytes, path: game.fs.restrictPath(path) };
	}
}

// TBD
export class Galaxy {
	starClusters: StarCluster[] = [];

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
export class StarCluster {
	starSystems: StarSystem[] = [];

	galaxy: Galaxy | undefined;

	static async discoverAll(galaxy?: Galaxy): Promise<StarCluster[]> {
		const starClusters: StarCluster[] = [];

		const starCluster = new StarCluster();
		starCluster.galaxy = galaxy;
		starCluster.starSystems = await StarSystem.discoverAll(starCluster);
		starClusters.push(starCluster);

		return starClusters;
	}
}

// Packs belonging to a specific author.
export class StarSystem {
	// @ts-expect-error This *will* be assigned a star. It's fine.
	star: Star;
	planets: Planet[] = [];

	starCluster: StarCluster | undefined;

	static async discoverAll(starCluster?: StarCluster): Promise<StarSystem[]> {
		const starSystems: StarSystem[] = [];

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
				const starSystem = new StarSystem();
				starSystem.starCluster = starCluster;

				const star = new Star();
				star.starSystem = starSystem;
				await star.scan(path);

				starSystem.star = star;
				starSystem.planets = await Planet.discoverAll(starSystem);
				starSystems.push(starSystem);
			},
			false,
		);

		return starSystems.toSorted((a, b) =>
			a.star.name.localeCompare(b.star.name),
		);
	}
}

// Author Info
export class Star {
	name: string = "";

	starSystem: StarSystem | undefined;

	async scan(path: string) {
		this.name = pathUtils.basename(path).slice(1);
	}
}

// Pack
export class Planet {
	name: string = "";
	moons: Moon[] = [];

	starSystem: StarSystem | undefined;

	/**
	 *
	 * @param starSystem
	 * @param star If `starSystem` isn't set, you need to set the star here.
	 * @returns
	 */
	static async discoverAll(
		starSystem?: StarSystem,
		star?: Star,
	): Promise<Planet[]> {
		if (!starSystem && !star) {
			throw new Error(
				"Planet isn't specified a solar system or a star. One of these need to be specified.",
			);
		}

		const authorName = (star ?? starSystem?.star)?.name as string;

		const planets: Planet[] = [];

		await game.fs.searchFolder(
			`/packs/@${authorName}`,
			async (index, path, file) => {
				if (!file.parentPath.endsWith(authorName) || !file.isDirectory()) {
					return;
				}

				const planet = new Planet();
				planet.starSystem = starSystem;
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

	get suspiciousness() {
		let suspiciousness = 0;
		for (const moon of this.moons) {
			for (const susp of Object.values(moon.violations)) {
				if (typeof susp === "number") {
					suspiciousness += susp;
				}
			}
		}

		return suspiciousness;
	}

	get violations() {
		let violations = 0;
		for (const moon of this.moons) {
			violations += Object.keys(moon.violations).length;
		}

		return violations;
	}

	get rejected() {
		const rejected = [];
		for (const moon of this.moons) {
			if (rejected.length > 0) break;

			for (const suspiciousness of Object.values(moon.violations)) {
				if (suspiciousness === "reject") {
					rejected.push(moon);
					break;
				}
			}
		}

		return rejected;
	}

	get errors() {
		let errors = 0;
		for (const moon of this.moons) {
			errors += Object.keys(moon.errors).length;
		}

		return errors;
	}

	get bytes() {
		let bytes = 0;
		for (const moon of this.moons) {
			bytes += moon.bytes;
		}

		return bytes;
	}
}

const defaultImportObject = {
	key: "",
	// NOTE: Don't include in the json file if false. This reduces how much space is used.
	isType: undefined as true | undefined,
	isDefault: undefined as true | undefined,
};

// Pack Resource
export class Moon {
	name: string = "";
	type: Resource = "card";

	blueprint?: Blueprint;
	command?: Command;
	sfx?: SFX;

	bytes: number = 0;
	violations: Record<string, number | "reject"> = {};
	imports: Record<string, (typeof defaultImportObject)[]> = {};
	dependencies: {
		components: {
			ids: string;
			authorName: string;
			packName: string;
			resourceType: string;
			resourceName: string;
			index: number;
			raw: string;
		};
		id: string | undefined;
	}[] = [];
	errors: { message: string; labels: ErrorLabel[] }[] = [];
	predictions = {
		networking: {
			using: undefined as true | undefined,
		},
		fileSystem: {
			using: undefined as true | undefined,
		},
	};

	// @ts-expect-error This *will* be assigned a planet. It's fine.
	planet: Planet;

	/**
	 *
	 * @param planet
	 * @param star If `planet` isn't set, you need to set the star here.
	 * @returns
	 */
	static async discoverAll(planet: Planet, star?: Star): Promise<Moon[]> {
		const authorName = (star ?? planet?.starSystem?.star)?.name as string;

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
		this.name = pathUtils.basename(path).split(".")[0];

		// Get resource type.
		this.type =
			(pathUtils.basename(path).split(".").slice(1).at(-2) as Resource) ||
			"card";

		const content = (await game.fs.call("readFile", path, "utf8", {
			invalidateCache: true,
		})) as string;
		this.bytes = Buffer.from(content, "utf8").byteLength;

		// Parse file using oxc.
		const result = parseSync(pathUtils.basename(path), content);

		// Check if an error was found.
		for (const error of result.errors) {
			if (error.severity === Severity.Error) {
				this.errors.push({ message: error.message, labels: error.labels });
			}
		}

		await this.getBlueprint(result, content);

		// Handle imports.
		await this.scanImports(result, content);
		await this.getDependencies(result, content);
		await this.makePredictions(result, content);
	}

	async getBlueprint(result: ParseResult, content: string) {
		// TODO: Actually get real blueprint / command / sfx.
		if (this.type === "card") {
			this.blueprint = {
				name: "Sheep",
				text: "",
				cost: 1,
				type: Type.Minion,
				classes: [Class.Neutral],
				rarity: Rarity.Free,
				collectible: false,
				tags: [],
				id: "019bc665-4f7f-7002-8cd4-7c81ad4e65c6",

				attack: 1,
				health: 1,
				tribes: [Tribe.Beast],
			};
		} else if (this.type === "command") {
			this.command = {
				name: "command",
				description: "Example command.",
				debug: false,
				id: "019bc665-4f7f-7002-8af5-2a5bc8d2e95c",

				run: async () => true,
			};
		} else if (this.type === "sfx") {
			this.sfx = {
				name: "sfx",
				id: "019bc665-4f7f-7002-8af5-72c96a787e82",

				play: async () => {},
			};
		}
	}

	async scanImports(result: ParseResult, content: string) {
		for (const stmt of result.program.body) {
			// Get imports.
			if (stmt.type === "ImportDeclaration") {
				// The source of the import.
				const source = stmt.source.value;

				for (const spec of stmt.specifiers) {
					// Get information about the import.
					const value = spec.local.name;
					const isType =
						stmt.importKind === "type" ||
						(spec.type === "ImportSpecifier" && spec.importKind === "type");
					const isDefault = spec.type === "ImportDefaultSpecifier";

					this.addImport(source, {
						key: value,
						isType: isType || undefined,
						isDefault: isDefault || undefined,
					});
				}
			}
		}

		// Increase suspiciousness based on certain imports.
		// TODO: Add more rules.
		const importRules = [
			{
				ruleName: "imports.file_system",
				condition: {
					// TODO: Check that this can't be bypassed by doing something like `import "f"+"s";`
					// or `import String.fromCharCode(0x66) + String.fromCharCode(0x73);` or something like that.
					sources: ["fs", "node:fs"],
				},
				// TODO: Is this an okay amount of suspiciousness?
				suspiciousness: +3,
				set: ["predictions.fileSystem.using=true"],
				activateOn: "success",
			},
			{
				ruleName: "imports.http",
				condition: {
					sources: [
						"http",
						"http2",
						"https",
						"node:http",
						"node:http2",
						"node:https",
						"axios",
					],
				},
				// TODO: Is this an okay amount of suspiciousness?
				suspiciousness: +5,
				set: ["predictions.networking.using=true"],
				activateOn: "success",
			},
			// TODO: Remove
			// {
			// 	ruleName: "imports.assert",
			// 	condition: {
			// 		keys: ["EventListenerMessage"],
			// 	},
			// 	suspiciousness: "reject",
			// 	activateOn: "success",
			// },
		];

		const handleImportRecord = (
			record: (typeof importRules)[0],
			result: boolean,
		) => {
			if (
				(record.activateOn === "success" && !result) ||
				(record.activateOn === "failure" && result)
			) {
				return;
			}

			if (Object.hasOwn(record, "suspiciousness")) {
				this.addViolation(
					record.ruleName,
					record.suspiciousness as number | "reject",
				);
			}
			if (Object.hasOwn(record, "set")) {
				const set: string[] = (record as any).set;
				const sets = set.map((set) => set.split("="));

				// biome-ignore lint/correctness/noUnusedVariables: Used in eval below.
				for (const [key, value] of sets) {
					// biome-ignore lint/security/noGlobalEval: The key is hardcoded in the code, it's fine.
					eval(`this.${key} = JSON.parse(value);`);
				}
			}

			applied.push(record);
		};

		const applied: (typeof importRules)[0][] = [];
		for (const [source, _objects] of Object.entries(this.imports)) {
			for (const record of importRules) {
				if (applied.includes(record)) {
					// The record has already been applied.
					continue;
				}

				let includesKey = false;
				// PERF: Oof.
				for (const [_, objects] of Object.entries(this.imports)) {
					for (const obj of objects) {
						if (Object.hasOwn(record, "keys")) {
							if ((record.condition as any).keys?.includes(obj.key)) {
								includesKey = true;
								break;
							}
						}
					}
				}

				handleImportRecord(
					record,
					record.condition.sources?.includes(source) || includesKey,
				);
			}
		}
	}

	addViolation(key: string, value: number | "reject") {
		if (
			!Object.keys(this.violations).includes(key) ||
			typeof value === "number"
		) {
			this.violations[key] = value;
		} else {
			this.violations[key] += value;
		}
	}

	async addImport(file: string, obj: Partial<typeof defaultImportObject>) {
		const importObject = {
			...defaultImportObject,
			...obj,
		};

		if (!importObject.key) {
			throw new Error(
				`The import '${JSON.stringify(obj, null, 4)}' does not have a key.`,
			);
		}

		if (!Object.hasOwn(this.imports, file)) {
			this.imports[file] = [importObject];
			return;
		}

		// Check if this key is already imported.
		if (this.imports[file].some((obj) => obj.key === importObject.key)) {
			return;
		}

		this.imports[file].push(importObject);
	}

	async getDependencies(result: ParseResult, content: string) {
		const idReferenceWithPackRegex =
			/game\s*\.\s*ids\s*\.\s*(.*?)\s*\.\s*(.*?)\s*\.\s*(.*?)\s*\.\s*(.*?)\s*\[\s*(\d+?)\s*\]/gm;
		// TODO: Handle this general index.
		const _idReferenceGeneralRegex = /game\s*\.\s*ids\s*\.\s*all\s*\.\s*(.*)/gm;

		for (const match of content.matchAll(idReferenceWithPackRegex)) {
			const authorName = match[1];
			const packName = match[2];
			const resourceType = match[3];
			const resourceName = match[4];
			const index = parseInt(match[5], 10);

			// Check if the dependency already exists
			const dependencyExists = this.dependencies.some(
				(dependency) =>
					dependency.components.authorName === authorName &&
					dependency.components.packName === packName &&
					dependency.components.resourceType === resourceType &&
					dependency.components.resourceName === resourceName &&
					dependency.components.index === index,
			);
			if (dependencyExists) {
				continue;
			}

			// Find id from `game.ids`. Do a bunch of validation.
			let id: string | undefined;
			if (Object.keys(game.ids).includes(authorName)) {
				const author = game.ids[authorName as keyof typeof game.ids];
				if (Object.keys(author).includes(packName)) {
					const packs = author[packName as keyof typeof author];
					if (Object.keys(packs).includes(resourceType)) {
						const resources = packs[resourceType];
						for (const rName of Object.keys(resources as any)) {
							if (rName !== resourceName) {
								// Not the correct resource. Keep looking.
								continue;
							}

							// This is all ids for that resource name.
							const ids: string[] = resources[rName];
							if (ids.length >= index + 1) {
								id = ids[index];
								break;
							}
						}
					}
				}
			}

			this.dependencies.push({
				components: {
					ids: "game.ids",
					authorName,
					packName,
					resourceType,
					resourceName,
					index,
					raw: `game.ids.${authorName}.${packName}.${resourceName}[${index}]`,
				},
				id,
			});
		}
	}

	async makePredictions(result: ParseResult, content: string) {
		const lower = content.toLowerCase();

		// File system operations.
		if (lower.includes("game.fs.call") || lower.includes("game.fs.search")) {
			if (!this.predictions.fileSystem.using) {
				// If we haven't detected file system usage before, add to suspiciousness.
				// This is so we don't double the suspiciousness accidentally.
				this.addViolation("imports.file_system", 3);
			}

			this.predictions.fileSystem.using = true;
		}
	}
}

export async function discover() {
	console.log("Discovering universe...");
	const universe = await Universe.discover();
	console.log("Mapping universe...");
	const result = await universe.export();
	console.log(`Universe mapped to '${result.path}'`);
}

if (import.meta.main) {
	await discover();
}
