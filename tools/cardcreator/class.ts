import { type Blueprint, type Class, Rarity, Tag, Type } from "@Game/types.ts";
import { confirm, input, number, Separator, select } from "@inquirer/prompts";
import { parseTags } from "chalk-tags";
import * as hub from "../../hub.ts";
import * as lib from "./lib.ts";

async function configure(
	heroBlueprint: Blueprint,
	heropowerBlueprint: Blueprint,
) {
	let dirty = false;

	while (true) {
		hub.watermark(false);

		const answer = await select({
			message: "Configure Class",
			choices: [
				{
					name: `Class Name (${heroBlueprint.classes[0]})`,
					value: "className",
					description: "The name of the class. Example: GnomeHunter",
				},
				new Separator(),
				{
					name: `Hero Name (${heroBlueprint.name})`,
					value: "heroName",
					description:
						"The name of the default hero. Example: Hunter Gnomingstein",
				},
				new Separator(),
				{
					name: `Heropower Name (${heropowerBlueprint.name})`,
					value: "heropowerName",
					description:
						"The name of the default hero's heropower. Example: Hunt Gnome",
				},
				{
					name: `Heropower Description (${heropowerBlueprint.text})`,
					value: "heropowerText",
					description:
						"The description of the default hero's heropower. Example: Deal 2 damage to a random enemy minion.",
				},
				{
					name: `Heropower Cost (${heropowerBlueprint.cost})`,
					value: "heropowerCost",
					description: "The cost of the default hero's heropower. Default: 2",
				},
				new Separator(),
				{
					name: "Cancel",
					value: "cancel",
					description: "Cancel changes to the class.",
				},
				{
					name: "Done",
					value: "done",
					description: "Done configuring class.",
				},
			],
			loop: false,
			pageSize: 12,
		});

		if (answer === "className") {
			const className = (await input({
				message: "Set the name of the class.",
				default: heroBlueprint.classes.at(0) ?? "ChangeMe",
				validate: (value) => !value.includes(" "),
			})) as Class;

			heroBlueprint.classes = [className];
			heropowerBlueprint.classes = [className];

			dirty = true;
		} else if (answer === "heroName") {
			heroBlueprint.name = await input({
				message: "Set the name of the default hero.",
				default: heroBlueprint.name,
			});

			dirty = true;
		} else if (answer === "heropowerName") {
			heropowerBlueprint.name = await input({
				message: "Set the name of the default hero's heropower.",
				default: heropowerBlueprint.name,
			});

			dirty = true;
		} else if (answer === "heropowerText") {
			heropowerBlueprint.text = await input({
				message: "Set the description of the default hero's heropower.",
				default: heropowerBlueprint.text,
			});

			dirty = true;
		} else if (answer === "heropowerCost") {
			heropowerBlueprint.cost = await number({
				message: "Set the cost of the default hero's heropower.",
				default: heropowerBlueprint.cost,
				required: true,
			});

			dirty = true;
		} else if (answer === "cancel") {
			if (!dirty) {
				// No changes have been made.
				return false;
			}

			const done = await confirm({
				message:
					"Are you sure you want to cancel configuring the class? Your changes will be lost.",
				default: false,
			});

			if (done) {
				return false;
			}
		} else if (answer === "done") {
			let message = "Are you sure you are done configuring the class?";

			if (heroBlueprint.classes[0] === ("ChangeMe" as Class)) {
				message = parseTags(
					"<yellow>You haven't changed the class name. Continue anyway?<yellow>",
				);
			}

			const done = await confirm({
				message,
				default: false,
			});

			if (done) {
				return true;
			}
		}
	}
}

/**
 * Asks the user a series of questions, and creates a class card using it.
 * This is not meant to be a library. Running this function will temporarily give control to this function.
 */
export async function main(debug = false): Promise<void> {
	const heroBlueprint: Blueprint = {
		name: "CHANGE ME",
		text: `Change me starting hero`,
		cost: 0,
		type: Type.Hero,
		classes: ["ChangeMe" as Class],
		rarity: Rarity.Free,
		collectible: false,
		tags: [Tag.StartingHero],
		// This will be overwritten by the library
		id: game.cardIds.null,

		armor: 0,
		// TODO: Get heropower id.
		heropowerId: game.cardIds.null,
	};

	const heropowerBlueprint: Blueprint = {
		name: "CHANGE ME",
		text: "",
		cost: 2,
		type: Type.HeroPower,
		classes: ["ChangeMe" as Class],
		rarity: Rarity.Free,
		collectible: false,
		tags: [],
		// This will be overwritten by the library
		id: game.cardIds.null,
	};

	const done = await configure(heroBlueprint, heropowerBlueprint);
	if (!done) {
		return;
	}

	const className = heroBlueprint.classes[0];

	const cctype: lib.CCType = lib.CCType.Class;
	await lib.create(
		cctype,
		heroBlueprint,
		`/cards/StartingHeroes/${game.lodash.startCase(className)}/`,
		"hero.ts",
		debug,
	);

	await lib.create(
		cctype,
		heropowerBlueprint,
		`/cards/StartingHeroes/${game.lodash.startCase(className)}/`,
		"heropower.ts",
		debug,
	);

	console.log("\nClass Created!");
	console.log("Next steps:");

	console.log(
		"1. Open 'src/types/card.ts', navigate to 'Class', and add the name of the class to that. There is unfortunately no way to automate that.",
	);

	console.log(
		// TODO: Use heropower id.
		"2. Open 'cards/StartingHeroes/%s/?-heropower.ts' and add logic to the 'cast' function.",
		game.lodash.startCase(className),
	);

	console.log(
		"3. Now when using the Custom Card Creator, type '%s' into the 'Class' field to use that class.",
		className,
	);

	console.log(
		"4. When using the Deck Creator, type '%s' to create a deck with cards from your new class.",
		className,
	);

	console.log("Enjoy!");
	await game.pause();
}
