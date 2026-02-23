import { Card } from "@Game/card.ts";
import { createGame } from "@Game/game.ts";
import { type Blueprint, type Class, Rarity, Tag, Type } from "@Game/types.ts";
import { confirm, number, Separator } from "@inquirer/prompts";
import { parseTags } from "chalk-tags";
import * as hub from "../../hub.ts";
import * as lib from "./lib.ts";

if (import.meta.main) {
	await createGame();
}

async function configure(
	heroBlueprint: Blueprint,
	heropowerBlueprint: Blueprint,
) {
	let dirty = false;
	let result = true;

	const hero = await Card.create(
		game.ids.Official.builtin.sheep[0],
		game.player,
	);
	const heropower = await Card.create(
		game.ids.Official.builtin.sheep[0],
		game.player,
	);

	await game.prompt.createUILoop(
		{
			message: "Configure Class",
			backButtonText: "Done",
			seperatorBeforeBackButton: false,
			callbackBefore: async () => {
				hub.watermark(false);

				// NOTE: The game is *not* meant for this. Oh well!
				hero.blueprint = heroBlueprint;
				await hero.doBlueprint(false, true);

				heropower.blueprint = heropowerBlueprint;
				await heropower.doBlueprint(false, true);

				const columns = [
					`Class: ${hero.classes[0]}`,
					`Hero: ${await hero.readable()}`,
					`Heropower: ${await heropower.readable()}`,
				];

				console.log(game.functions.util.alignColumns(columns, ":").join("\n"));
				console.log();
			},
		},
		{
			name: "Class Name",
			description: "The name of the class. Example: GnomeHunter",
			callback: async () => {
				const className = (await game.input({
					message: "Set the name of the class.",
					default: heroBlueprint.classes.at(0) ?? "ChangeMe",
					validate: (value) => !value.includes(" "),
				})) as Class;

				heroBlueprint.classes = [className];
				heropowerBlueprint.classes = [className];

				const classNameText =
					className[0].toUpperCase() +
					game.lodash.startCase(className).slice(1).toLowerCase();
				heroBlueprint.text = `${classNameText} starting hero`;

				dirty = true;
				return true;
			},
		},
		new Separator(),
		{
			name: "Hero Name",
			description: "The name of the default hero. Example: Hunter Gnomingstein",
			callback: async () => {
				heroBlueprint.name = await game.input({
					message: "Set the name of the default hero.",
					default: heroBlueprint.name,
				});

				dirty = true;
				return true;
			},
		},
		new Separator(),
		{
			name: "Heropower Name",
			description:
				"The name of the default hero's heropower. Example: Hunt Gnome",
			callback: async () => {
				heropowerBlueprint.name = await game.input({
					message: "Set the name of the default hero's heropower.",
					default: heropowerBlueprint.name,
				});

				dirty = true;
				return true;
			},
		},
		{
			name: "Heropower Description",
			description:
				"The description of the default hero's heropower. Example: Deal 2 damage to a random enemy minion.",
			callback: async () => {
				heropowerBlueprint.text = await game.input({
					message: "Set the description of the default hero's heropower.",
					default: heropowerBlueprint.text,
				});

				dirty = true;
				return true;
			},
		},
		{
			name: "Heropower Cost",
			description: "The cost of the default hero's heropower. Default: 2",
			callback: async () => {
				// TODO: Use `game.input` instead of `number`.
				heropowerBlueprint.cost = await number({
					message: "Set the cost of the default hero's heropower.",
					default: heropowerBlueprint.cost,
					required: true,
				});

				dirty = true;
				return true;
			},
		},
		new Separator(),
		{
			name: "Cancel",
			description: "Cancel changes to the class.",
			callback: async () => {
				if (!dirty) {
					// No changes have been made.
					result = false;
					return false;
				}

				const done = await confirm({
					message:
						"Are you sure you want to cancel configuring the class? Your changes will be lost.",
					default: false,
				});

				if (done) {
					result = false;
					return false;
				}

				return true;
			},
		},
		{
			name: "Done",
			description: "Done configuring class.",
			callback: async () => {
				let message = "Are you sure you are done configuring the class?";

				if (heroBlueprint.classes[0] === ("ChangeMe" as Class)) {
					message = parseTags(
						"<yellow>You haven't changed the class name. Continue anyway?</yellow>",
					);
				}

				const done = await confirm({
					message,
					default: false,
				});

				if (done) {
					return false;
				}

				return true;
			},
		},
	);

	return result;
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
		id: game.ids.null,

		armor: 0,
		// TODO: Get heropower id.
		heropowerId: game.ids.null,
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
		id: game.ids.null,
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
		`/cards/Custom/StartingHeroes/${game.lodash.startCase(className)}/`,
		"hero.ts",
		debug,
	);

	await lib.create(
		cctype,
		heropowerBlueprint,
		`/cards/Custom/StartingHeroes/${game.lodash.startCase(className)}/`,
		"heropower.ts",
		debug,
	);

	// TODO: Automate actually adding the class. See #466

	console.log("\nClass Created!");
	console.log("Next steps:");

	console.log(
		"1. Open 'src/types/card.ts', navigate to 'Class', and add the name of the class to that. There is unfortunately no way to automate that.",
	);

	console.log(
		// TODO: Use heropower id.
		"2. Open 'cards/Custom/StartingHeroes/%s/?-heropower.ts' and add logic to the 'cast' function.",
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

if (import.meta.main) {
	await main();
}
