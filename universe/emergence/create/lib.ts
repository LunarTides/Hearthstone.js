import { color } from "@Game/modules/color.ts";
import { fileSystem } from "@Game/modules/fs.ts";
import {
	Ability,
	type BlueprintWithOptional,
	type Command,
	type SFX,
	Type,
} from "@Game/types.ts";

const EMERGENCE_VERSION = "0.1.0";

let lines: string[] = [];
let imports: Record<string, (typeof defaultImportObject)[]> = {};

const defaultImportObject = {
	key: "",
	type: false,
	direct: false,
};

const resourceTypeHooks = {
	card: {
		path: async (resource: BlueprintWithOptional) => {
			const filename = `${resource.name
				.toLowerCase()
				.replaceAll(" ", "-")
				// Remove non-alphanummeric characters.
				.replaceAll(
					/[^a-z\d-]/g,
					"",
				)}-${resource.id.split("-").at(-1)!.slice(0, 8)}.ts`;

			return `/cards/${resource.type.toLowerCase()}/${filename}`;
		},
		imports: async (resource: BlueprintWithOptional) => {
			addImport("@Game/types.ts", { key: "Blueprint", type: true });
			addImport("@Game/types.ts", { key: "Class" });

			if (resource.text) {
				// If the card has a description, it will have a test ability.
				addImport("@Game/types.ts", { key: "EventListenerMessage" });
				addImport("node:assert", { key: "assert", direct: true });
			}
			if ((resource.keywords?.length ?? 0) > 0) {
				addImport("@Game/types.ts", { key: "Keyword" });
			}

			addImport("@Game/types.ts", { key: "Rarity" });

			if ((resource.runes?.length ?? 0) > 0) {
				addImport("@Game/types.ts", { key: "Rune" });
			}

			switch (resource.type) {
				case Type.Minion: {
					addImport("@Game/types.ts", { key: "Tribe" });
					break;
				}
				case Type.Spell: {
					addImport("@Game/types.ts", { key: "SpellSchool" });
					break;
				}
				case Type.Weapon: {
					break;
				}
				case Type.Location: {
					break;
				}
				case Type.Hero: {
					break;
				}
				case Type.HeroPower: {
					break;
				}
				case Type.Enchantment: {
					addImport("@Game/types.ts", { key: "EnchantmentPriority" });
					break;
				}
				default:
					throw new Error(`Cannot handle card type '${resource.type}'.`);
			}

			if (resource.tags.length > 0) {
				addImport("@Game/types.ts", { key: "Tag" });
			}

			// NOTE: Biome places this type after everything else.
			addImport("@Game/types.ts", { key: "Type" });
		},
		export: async (resource: BlueprintWithOptional) =>
			`export const blueprint: Blueprint`,
		fields: async (resource: BlueprintWithOptional) => {
			// A list of fields that should use enums instead of strings.
			const enumMappings = {
				type: "Type",
				classes: "Class",
				rarity: "Rarity",
				tags: "Tag",

				tribes: "Tribe",
				spellSchools: "SpellSchool",
				enchantmentPriority: "EnchantmentPriority",
			};

			// A list of fields that won't be included.
			const blacklist = ["keywords", "runes", "id"];

			for (const [key, value] of Object.entries(resource)) {
				if (blacklist.includes(key)) {
					continue;
				}

				const enumMapping = enumMappings[key as keyof typeof enumMappings] as
					| string
					| undefined;

				let jsonValue = JSON.stringify(value).replaceAll(",", ", ");
				if (
					jsonValue !== "null" &&
					jsonValue !== "undefined" &&
					jsonValue !== "[]" &&
					enumMapping
				) {
					if (jsonValue.startsWith("[")) {
						// Handle array mappings.
						jsonValue =
							"[" +
							jsonValue
								.replace("[", "")
								.split(", ")
								.map((v) => `${enumMapping}.${v.replaceAll('"', "")}`)
								.join(", ");
					} else {
						// Handle single mappings.
						jsonValue = `${enumMapping}.${jsonValue.replaceAll('"', "")}`;
					}
				}

				addLine(`\t${key}: ${jsonValue},`);

				if (key === "tags") {
					// Manually add id after tags. This is so that it is in the right order.
					addLine(`\tid: "${resource.id}",`);

					// Add a newline between required fields and type-specific ones.
					addLine();
				}
			}
		},
		methods: async (resource: BlueprintWithOptional) => {
			const cleanedDescription = color.stripTags(resource.text);
			const abilities: string[] = [];

			// If the card has keywords or runes, add a create ability.
			if (
				(resource.keywords?.length ?? 0) > 0 ||
				(resource.runes?.length ?? 0) > 0
			) {
				abilities.push("create");
			}

			switch (resource.type) {
				case Type.Spell: {
					abilities.push(Ability.Cast);
					break;
				}
				case Type.Location: {
					abilities.push(Ability.Use);
					break;
				}
				case Type.HeroPower: {
					abilities.push(Ability.HeroPower);
					break;
				}
				case Type.Enchantment: {
					abilities.push(
						Ability.EnchantmentSetup,
						Ability.EnchantmentApply,
						Ability.EnchantmentRemove,
					);
					break;
				}

				case Type.Minion:
				case Type.Weapon:
				case Type.Hero: {
					if (!resource.text) {
						// If the blueprint doesn't have a description, it probably doesn't have any abilities.
						break;
					}

					// Try to extract the abilities from the card's description
					const reg = /(?:^|\. )(?:<.*?>)?([A-Z][a-z].*?):/g;
					const foundAbilities = resource.text.match(reg);
					if (!foundAbilities) {
						// No valid abilities in description. Assume passive ability.
						abilities.push(Ability.Passive);
						break;
					}

					const extracted = foundAbilities.map((ability) =>
						ability
							.replace(/:$/, "") // Remove colon.
							.replace(/^\. /, "") // Remove leading period. This can happen in specified cases.
							.replace(/^<.*?>/, "") // Remove tags.
							.toLowerCase(),
					);

					// Only use valid abilities
					const validAbilities = extracted.filter((ability) =>
						Object.values(Ability).includes(ability as Ability),
					) as Ability[];

					if (validAbilities.length <= 0) {
						// No valid abilities in description. Assume passive ability.
						abilities.push(Ability.Passive);
						break;
					}

					abilities.push(...validAbilities);
				}
			}

			if (abilities.length > 0) {
				abilities.push("test");
			}

			return abilities.map((ability) => {
				// Create
				if (ability === "create") {
					return {
						name: ability,
						args: ["self", "owner"],
						comment: cleanedDescription,
						lines: [
							...(resource.keywords ?? []).map(
								(keyword) =>
									`self.addKeyword(Keyword.${keyword.replaceAll(" ", "")});`,
							),
							// Add seperator between keywords and runes.
							resource.keywords?.length && resource.runes?.length && "",
							resource.runes?.length &&
								`self.runes = [${resource.runes.map((rune) => `Rune.${rune}`).join(", ")}];`,
						],
						newline: false,
					};
				}

				// Passive
				if (ability === "passive") {
					// We need the Event type here.
					addImport("@Game/types.ts", { key: "Event" });

					return {
						name: ability,
						args: ["self", "owner", "key", "value", "eventPlayer"],
						comment: `${cleanedDescription}\n`,
						lines: [
							"// Only proceed if the correct event key was broadcast.",
							"if (!game.event.is(key, value, Event.ChangeMe)) {",
							"\treturn;",
							"};",
							"",
						],
						newline: true,
					};
				}

				// Test
				if (ability === "test") {
					return {
						name: ability,
						args: ["self", "owner"],
						comment: "Unit testing.",
						lines: ["return EventListenerMessage.Skip;"],
						newline: false,
					};
				}

				// Other
				return {
					name: ability,
					args: ["self", "owner"],
					comment: cleanedDescription,
					lines: [],
					newline: true,
				};
			});
		},
	},
	command: {
		path: async (resource: Command) =>
			`/commands/${resource.name.toLowerCase().replaceAll(" ", "-")}.command.ts`,
		imports: async (resource: Command) => {
			addImport("@Game/types.ts", { key: "Command", type: true });
		},
		export: async (resource: Command) => `export const command: Command`,
		fields: async (resource: Command) => {
			for (const [key, value] of Object.entries(resource)) {
				addLine(`\t${key}: ${JSON.stringify(value).replaceAll(",", ", ")},`);
			}
		},
		methods: async (resource: Command) => {
			const cleanedDescription = color.stripTags(resource.description);

			return [
				{
					name: "run",
					args: ["args", "useTUI"],
					comment: cleanedDescription,
					lines: [],
					newline: true,
				},
			];
		},
	},
	sfx: {
		path: async (resource: SFX) =>
			`/sfx/${resource.name.toLowerCase().replaceAll(" ", "-")}.sfx.ts`,
		imports: async (resource: SFX) => {
			addImport("@Game/types.ts", { key: "SFX", type: true });
			addImport("@Game/modules/audio/audio.ts", { key: "octaves" });
		},
		export: async (resource: SFX) => `export const sfx: SFX`,
		fields: async (resource: SFX) => {
			for (const [key, value] of Object.entries(resource)) {
				addLine(`\t${key}: ${JSON.stringify(value).replaceAll(",", ", ")},`);
			}
		},
		methods: async (resource: SFX) => {
			return [
				{
					name: "play",
					args: ["info", "options"],
					comment:
						"Play a sine wave at A4 for 1000ms, with 0 delay after the wave, at 0.3 volume.",
					lines: [
						'game.audio.playWave("sine", octaves[4].A, 1000, 0.3, 0, 0, options);',
					],
					newline: false,
				},
			];
		},
	},
};

const addLine = (line: string = "") => {
	lines.push(line);
};

const addImport = (file: string, obj: Partial<typeof defaultImportObject>) => {
	const importObject = {
		...defaultImportObject,
		...obj,
	};

	if (!importObject.key) {
		throw new Error(
			`The import '${JSON.stringify(obj, null, 4)}' does not have a key.`,
		);
	}

	if (!Object.hasOwn(imports, file)) {
		imports[file] = [importObject];
		return;
	}

	imports[file].push(importObject);
};

const universeInfo = () => {
	let result = "";

	result += `// *UNIVERSE/EMERGENCE*\n`;
	result += `// *version: ${EMERGENCE_VERSION}\n`;
	result += "\n";

	return result;
};

const finish = () => {
	let result = "";

	result += universeInfo();

	// Imports
	for (const [file, objects] of Object.entries(imports)) {
		const direct = objects.filter((obj) => obj.direct);
		const nondirect = objects.filter((obj) => !obj.direct);

		// FIXME: Maybe a bit *too* readable?
		result += `import ${direct.length > 0 ? `${direct.map((obj) => `${obj.key}`).join(", ")}${nondirect.length > 0 ? ", " : ""}` : ""}${
			nondirect.length > 0
				? `{ ${nondirect
						.map((obj) => `${obj.type ? "type " : ""}${obj.key}`)
						.join(", ")} }`
				: ""
		} from "${file}";\n`;
	}
	result += "\n";

	// Lines
	result += lines.join("\n");
	result += "\n";
	return result;
};

type ResourceObject<T extends keyof typeof resourceTypeHooks> = T extends "card"
	? BlueprintWithOptional
	: T extends "command"
		? Command
		: T extends "sfx"
			? SFX
			: undefined;

export async function createFileContent<
	T extends keyof typeof resourceTypeHooks,
>(resourceType: T, resource: ResourceObject<T>) {
	lines = [];
	imports = {};

	if (resourceType === "card") {
		// Generate random id.
		const id = Bun.randomUUIDv7();
		(resource as BlueprintWithOptional).id = id;
	}

	const hooks = resourceTypeHooks[resourceType];
	// HACK: as any usage. Idk how to properly narrow the type here, but this should be safe.
	await hooks.imports(resource as any);

	// Main Content
	const resourceExport = await hooks.export(resource as any);
	addLine(`${resourceExport} = {`);
	// {
	// Fields
	await hooks.fields(resource as any);

	// Methods
	const methods = await hooks.methods(resource as any);

	for (const method of methods) {
		addLine();
		addLine(`\tasync ${method.name}(${method.args.join(", ")}) {`);
		// {
		if (method.comment) {
			addLine(`\t\t// ${method.comment}`);
		}
		if (method.lines.length > 0) {
			addLine(`\t\t${method.lines.join("\n\t\t")}`);
		}
		if (method.newline !== false) {
			addLine("\t\t");
		}
		// }
		addLine("\t},");
	}
	// }
	addLine("};");

	return finish();
}

export async function create<T extends keyof typeof resourceTypeHooks>(
	resourceType: T,
	resource: ResourceObject<T>,
) {
	const hooks = resourceTypeHooks[resourceType];

	const content = await createFileContent(resourceType, resource);
	const path = await hooks.path(resource as any);

	const actualPath = fileSystem.restrictPath(
		`/cards/custom/${path.replace(/^\//, "")}`,
	);
	const bytes = await Bun.write(actualPath, content);

	return {
		path: actualPath,
		content,
		bytes,
	};
}
