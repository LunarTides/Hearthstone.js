import { createGame } from "@Game/game.ts";
import pathUtils from "node:path";
import {
	type ErrorLabel,
	type ParseResult,
	parseSync,
	Severity,
} from "oxc-parser";
import type { Resource } from "universe/emergence/create/lib.ts";

// TODO: Remove.
await createGame(false);

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
	baseSuspiciousness: number = 0;
	combinedSuspiciousness: number = 0;
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

const defaultImportObject = {
	key: "",
	// NOTE: Don't include in the json file if false. This reduces how much space is used.
	isType: undefined as true | undefined,
	isDefault: undefined as true | undefined,
};

// Pack Resource
class Moon {
	name: string;
	type: Resource;

	bytes: number;
	suspiciousness: number = 0;
	imports: Record<string, (typeof defaultImportObject)[]> = {};
	// TODO: Get dependencies.
	dependencies: {
		components: {
			ids: string;
			authorName: string;
			packName: string;
			resourceName: string;
			index: number;
			raw: string;
		};
		id: string | undefined;
	}[];
	errors: { message: string; labels: ErrorLabel[] }[] = [];
	predictions = {
		networking: {
			using: undefined as true | undefined,
		},
		fileSystem: {
			using: undefined as true | undefined,
		},
	};

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

		// Handle imports.
		await this.scanImports(result, content);
		await this.getDependencies(result, content);
		await this.makePredictions(result, content);
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
		const importRecords = [
			{
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
				condition: {
					sources: ["https", "node:https", "axios"],
				},
				// TODO: Is this an okay amount of suspiciousness?
				suspiciousness: +5,
				set: ["predictions.networking.using=true"],
				activateOn: "success",
			},
			// TODO: Remove
			{
				condition: {
					keys: ["Keyword"],
				},
				suspiciousness: -2,
				activateOn: "failure",
			},
			// TODO: Remove
			{
				condition: {
					sources: ["assert", "node:assert"],
				},
				suspiciousness: 1,
				activateOn: "success",
			},
		];

		const handleImportRecord = (
			record: (typeof importRecords)[0],
			result: boolean,
		) => {
			if (
				(record.activateOn === "success" && !result) ||
				(record.activateOn === "failure" && result)
			) {
				return;
			}

			if (Object.hasOwn(record, "suspiciousness")) {
				this.suspiciousness += (record as any).suspiciousness;
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

		const applied: (typeof importRecords)[0][] = [];
		for (const [source, _objects] of Object.entries(this.imports)) {
			for (const record of importRecords) {
				if (applied.includes(record)) {
					// The record has already been applied.
					continue;
				}

				let includesKey = false;
				// PERF: Oof.
				for (const [_, objects] of Object.entries(this.imports)) {
					for (const obj of objects) {
						if (record.condition.keys?.includes(obj.key)) {
							includesKey = true;
							break;
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
		// TODO: Check `game.ids` references and find the actual id from the `ids.ts` file.
		//
		// Solution (See output):
		// Find `MemberExpression` objects. Find an expression with property name "ids" and object name "game".
		// Handle the `ids` object being split somehow. Or just increase suspiciousness if that's detected if the former is too hard.
		// Search for the author name, pack name, resource name, and index. Use that information to find the id in `ids.ts`.
		// If the id isn't there, express that somehow. Dependency object:
		// {
		//   components: {
		//     ids: "game.ids",
		//     authorName: "Official",
		//     packName: "builtin",
		//     resourceName: "the_coin",
		//     index: 0,
		//     raw: "game.ids.Official.builtin.the_coin[0]",
		//   },
		//   id: uuidv7 | undefined, // Undefined if not found in `ids.ts`
		// }
		//
		// Input:
		// const coin = game.ids.Official.builtin.the_coin[0];
		// console.log(await coin.readable());
		//
		// Output (result.program):
		// {
		//     "type": "Program",
		//     "start": 1,
		//     "end": 89,
		//     "body": [
		//       {
		//         "type": "VariableDeclaration",
		//         "start": 1,
		//         "end": 52,
		//         "kind": "const",
		//         "declarations": [
		//           {
		//             "type": "VariableDeclarator",
		//             "start": 7,
		//             "end": 51,
		//             "id": {
		//               "type": "Identifier",
		//               "start": 7,
		//               "end": 11,
		//               "decorators": [],
		//               "name": "coin",
		//               "optional": false,
		//               "typeAnnotation": null
		//             },
		//             "init": {
		//               "type": "MemberExpression",
		//               "start": 14,
		//               "end": 51,
		//               "object": {
		//                 "type": "MemberExpression",
		//                 "start": 14,
		//                 "end": 48,
		//                 "object": {
		//                   "type": "MemberExpression",
		//                   "start": 14,
		//                   "end": 39,
		//                   "object": {
		//                     "type": "MemberExpression",
		//                     "start": 14,
		//                     "end": 31,
		//                     "object": {
		//                       "type": "MemberExpression",
		//                       "start": 14,
		//                       "end": 22,
		//                       "object": {
		//                         "type": "Identifier",
		//                         "start": 14,
		//                         "end": 18,
		//                         "decorators": [],
		//                         "name": "game",
		//                         "optional": false,
		//                         "typeAnnotation": null
		//                       },
		//                       "property": {
		//                         "type": "Identifier",
		//                         "start": 19,
		//                         "end": 22,
		//                         "decorators": [],
		//                         "name": "ids",
		//                         "optional": false,
		//                         "typeAnnotation": null
		//                       },
		//                       "optional": false,
		//                       "computed": false
		//                     },
		//                     "property": {
		//                       "type": "Identifier",
		//                       "start": 23,
		//                       "end": 31,
		//                       "decorators": [],
		//                       "name": "Official",
		//                       "optional": false,
		//                       "typeAnnotation": null
		//                     },
		//                     "optional": false,
		//                     "computed": false
		//                   },
		//                   "property": {
		//                     "type": "Identifier",
		//                     "start": 32,
		//                     "end": 39,
		//                     "decorators": [],
		//                     "name": "builtin",
		//                     "optional": false,
		//                     "typeAnnotation": null
		//                   },
		//                   "optional": false,
		//                   "computed": false
		//                 },
		//                 "property": {
		//                   "type": "Identifier",
		//                   "start": 40,
		//                   "end": 48,
		//                   "decorators": [],
		//                   "name": "the_coin",
		//                   "optional": false,
		//                   "typeAnnotation": null
		//                 },
		//                 "optional": false,
		//                 "computed": false
		//               },
		//               "property": {
		//                 "type": "Literal",
		//                 "start": 49,
		//                 "end": 50,
		//                 "value": 0,
		//                 "raw": "0"
		//               },
		//               "optional": false,
		//               "computed": true
		//             },
		//             "definite": false
		//           }
		//         ],
		//         "declare": false
		//       },
		//       {
		//         "type": "ExpressionStatement",
		//         "start": 53,
		//         "end": 88,
		//         "expression": {
		//           "type": "CallExpression",
		//           "start": 53,
		//           "end": 87,
		//           "callee": {
		//             "type": "MemberExpression",
		//             "start": 53,
		//             "end": 64,
		//             "object": {
		//               "type": "Identifier",
		//               "start": 53,
		//               "end": 60,
		//               "decorators": [],
		//               "name": "console",
		//               "optional": false,
		//               "typeAnnotation": null
		//             },
		//             "property": {
		//               "type": "Identifier",
		//               "start": 61,
		//               "end": 64,
		//               "decorators": [],
		//               "name": "log",
		//               "optional": false,
		//               "typeAnnotation": null
		//             },
		//             "optional": false,
		//             "computed": false
		//           },
		//           "typeArguments": null,
		//           "arguments": [
		//             {
		//               "type": "AwaitExpression",
		//               "start": 65,
		//               "end": 86,
		//               "argument": {
		//                 "type": "CallExpression",
		//                 "start": 71,
		//                 "end": 86,
		//                 "callee": {
		//                   "type": "MemberExpression",
		//                   "start": 71,
		//                   "end": 84,
		//                   "object": {
		//                     "type": "Identifier",
		//                     "start": 71,
		//                     "end": 75,
		//                     "decorators": [],
		//                     "name": "coin",
		//                     "optional": false,
		//                     "typeAnnotation": null
		//                   },
		//                   "property": {
		//                     "type": "Identifier",
		//                     "start": 76,
		//                     "end": 84,
		//                     "decorators": [],
		//                     "name": "readable",
		//                     "optional": false,
		//                     "typeAnnotation": null
		//                   },
		//                   "optional": false,
		//                   "computed": false
		//                 },
		//                 "typeArguments": null,
		//                 "arguments": [],
		//                 "optional": false
		//               }
		//             }
		//           ],
		//           "optional": false
		//         },
		//         "directive": null
		//       }
		//     ],
		//     "sourceType": "module",
		//     "hashbang": null
		//   }
	}

	async makePredictions(result: ParseResult, content: string) {
		const lower = content.toLowerCase();

		// File system operations.
		if (lower.includes("game.fs.call") || lower.includes("game.fs.search")) {
			if (!this.predictions.fileSystem.using) {
				// If we haven't detected file system usage before, add to suspiciousness.
				// This is so we don't double the suspiciousness accidentally.
				this.suspiciousness += 3;
			}

			this.predictions.fileSystem.using = true;
		}
	}
}

console.log("Discovering universe...");
const universe = await Universe.discover();
console.log("Exporting universe...");
const result = await universe.export();
console.log(`Exported universe to '${result.path}'`);
