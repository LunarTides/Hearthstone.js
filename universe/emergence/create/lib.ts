import { color } from "@Game/modules/color.ts";
import { data } from "@Game/modules/data.ts";
import { fileSystem } from "@Game/modules/fs.ts";
import {
	Ability,
	type BlueprintWithOptional,
	Class,
	type Command,
	EnchantmentPriority,
	Keyword,
	Rarity,
	Rune,
	type SFX,
	SpellSchool,
	Tag,
	Tribe,
	Type,
} from "@Game/types.ts";
import { EMERGENCE_VERSION } from "../lib.ts";

let lines: string[] = [];
let imports: Record<string, (typeof defaultImportObject)[]> = {};

const defaultImportObject = {
	key: "",
	type: false,
	direct: false,
};

export const resourceTypeHooks = {
	card: {
		path: async (resource: BlueprintWithOptional) => {
			const filename = `${resource.name
				.toLowerCase()
				.replaceAll(" ", "_")
				.replaceAll(
					// Remove non-alphanummeric characters.
					/[^a-z\d_]/g,
					"",
				)}_${resource.id.split("_").at(-1)!.slice(0, 8)}.ts`;

			return `/packs/${resource.type.toLowerCase()}/${filename}`;
		},
		imports: async (resource: BlueprintWithOptional) => {
			// NOTE: The other imports are added in `fields`.
			addImport("@Game/types.ts", { key: "Blueprint", type: true });
		},
		export: async (resource: BlueprintWithOptional) =>
			`const blueprint: Blueprint`,
		fields: async (resource: BlueprintWithOptional) => {
			// A list of fields that should use enums instead of strings.
			const enumMappings = await resourceTypeHooks.card.enumMappings();

			// A list of fields that won't be included.
			const blacklist = ["keywords", "runes", "id"];

			for (const [key, value] of Object.entries(resource)) {
				if (blacklist.includes(key)) {
					continue;
				}

				const enumMapping = enumMappings[key as keyof typeof enumMappings]
					?.name as string | undefined;

				let jsonValue = JSON.stringify(value).replaceAll(",", ", ");
				if (
					jsonValue !== "null" &&
					jsonValue !== "undefined" &&
					jsonValue !== "[]" &&
					enumMapping
				) {
					// Dynamically import the enum when required. This is pretty cool!
					addImport("@Game/types.ts", { key: enumMapping });

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
			// TODO: Detect placeholders in the card's text.
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

			// If there is a passive ability, add the create ability to the start.
			if (abilities.includes("passive") && !abilities.includes("create")) {
				abilities.unshift("create");
			}

			if (abilities.length > 0) {
				abilities.push("test");
			}

			// Enchantments shouldn't have the `create` ability.
			// They should use `enchantmentCreate` instead.
			if (resource.type === Type.Enchantment) {
				data.remove(abilities, "create");
			}

			return abilities.map((ability) => {
				// Create
				if (ability === "create") {
					// Add the Keyword / Rune imports if needed.
					if (resource.keywords?.length) {
						addImport("@Game/types.ts", { key: "Keyword" });
					}
					if (resource.runes?.length) {
						addImport("@Game/types.ts", { key: "Rune" });
					}

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
					addImport("@Game/types.ts", { key: "EventListenerMessage" });
					addImport("node:assert", { key: "assert", direct: true });

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
		enumMappings: async () => ({
			type: { name: "Type", enum: Type },
			classes: { name: "Class", enum: Class },
			rarity: { name: "Rarity", enum: Rarity },
			tags: { name: "Tag", enum: Tag },

			tribes: { name: "Tribe", enum: Tribe },
			spellSchools: { name: "SpellSchool", enum: SpellSchool },
			enchantmentPriority: {
				name: "EnchantmentPriority",
				enum: EnchantmentPriority,
			},

			keywords: { name: "Keyword", enum: Keyword },
			runes: { name: "Rune", enum: Rune },
		}),
		postCreate: async (resource: BlueprintWithOptional) => {
			if (!game) {
				return;
			}

			game.blueprints.push(resource);
			await game.card.generateIdsFile();
		},
	},
	command: {
		path: async (resource: Command) =>
			`/commands/${resource.name.toLowerCase().replaceAll(" ", "_")}.command.ts`,
		imports: async (resource: Command) => {
			addImport("@Game/types.ts", { key: "Command", type: true });
		},
		export: async (resource: Command) => `const command: Command`,
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
		enumMappings: async () => ({}),
		postCreate: async (resource: Command) => {},
	},
	sfx: {
		path: async (resource: SFX) =>
			`/sfx/${resource.name.toLowerCase().replaceAll(" ", "_")}.sfx.ts`,
		imports: async (resource: SFX) => {
			addImport("@Game/types.ts", { key: "SFX", type: true });
			addImport("@Game/modules/audio/audio.ts", { key: "octaves" });
		},
		export: async (resource: SFX) => `const sfx: SFX`,
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
		enumMappings: async () => ({}),
		postCreate: async (resource: SFX) => {},
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

	// Check if this key is already imported.
	if (imports[file].some((obj) => obj.key === importObject.key)) {
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

export type Resource = keyof typeof resourceTypeHooks;
export type ResourceObject<T extends Resource> = T extends "card"
	? BlueprintWithOptional
	: T extends "command"
		? Command
		: T extends "sfx"
			? SFX
			: undefined;

export async function createFileContent<T extends Resource>(
	resourceType: T,
	resource: ResourceObject<T>,
) {
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
	addLine(`export ${resourceExport} = {`);
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
			addLine(
				`\t\t${method.lines.filter((line) => typeof line === "string").join("\n\t\t")}`,
			);
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

export async function create<T extends Resource>(
	resourceType: T,
	resource: ResourceObject<T>,
) {
	const hooks = resourceTypeHooks[resourceType];

	const content = await createFileContent(resourceType, resource);
	const path = await hooks.path(resource as any);

	const actualPath = fileSystem.restrictPath(
		`/packs/custom/${path.replace(/^\//, "")}`,
	);
	const bytes = await Bun.write(actualPath, content);

	return {
		path: actualPath,
		content,
		bytes,
	};
}

export async function postCreate<T extends Resource>(
	resourceType: T,
	resource: ResourceObject<T>,
) {
	const hooks = resourceTypeHooks[resourceType];
	await hooks.postCreate(resource as any);
}
