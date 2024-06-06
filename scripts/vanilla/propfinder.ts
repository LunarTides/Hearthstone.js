/**
 * @module Vanilla Card Property Finder
 */

import process from "node:process";
import { createGame } from "@Game/internal.js";
import type { VanillaCard } from "@Game/types.js";
import date from "date-and-time";

const { game } = createGame();

const props: Record<string, [string, number]> = {};
const stored: Record<string, Array<[unknown, number]>> = {};

const whitelistedProps = new Set<keyof VanillaCard>([
	"cardClass",
	"set",
	"type",
	"rarity",
	"faction",
	"spellSchool",
	"mechanics",
	"race",
	"multiClassGroup",
]);

/**
 * Does something(?) to the key and value and applies it to `stored`.
 */
function handleStoredTypes(key: keyof VanillaCard, value: unknown): void {
	if (!whitelistedProps.has(key)) {
		return;
	}

	const values = Array.isArray(value) ? value : [value];

	for (const value of values) {
		if (!stored[key]) {
			stored[key] = [[value, 1]];
			continue;
		}

		const found = stored[key].find((s) => game.lodash.isEqual(s[0], value));
		if (found) {
			found[1]++;
		} else {
			stored[key].push([value, 1]);
		}
	}
}

/**
 * Runs the propfinder
 */
function main(): void {
	const vanillaCards = game.functions.card.vanilla.getAll();

	for (const [index, vanillaCard] of vanillaCards.entries()) {
		if (!process.stdout.isTTY && index % 100 === 0) {
			process.stderr.write(
				`\r\u001B[KProcessing ${index / 100 + 1} / ${Math.ceil(vanillaCards.length / 100)}...`,
			);
		}

		for (const entry of Object.entries(vanillaCard)) {
			const [key, value] = entry;

			handleStoredTypes(key as keyof VanillaCard, value);

			if (Object.keys(props).includes(key)) {
				const storedType = props[key][0];
				if (storedType !== (typeof value).toString()) {
					console.warn(
						"<yellow>Discrepancy found. Stored type: %s, Found type %s.</yellow>",
						storedType,
						typeof value,
					);
				}

				props[key][1]++;
				continue;
			}

			props[key] = [typeof value, 1];
		}
	}

	const now = new Date();
	const dateString = date.format(now, "DD/MM/YYYY");

	console.log(`// Last Updated: ${dateString} (DD/MM/YYYY)`);
	console.log("// Tested with: https://hearthstonejson.com");

	for (const object of Object.entries(stored)) {
		let [key, value] = object;
		value = value.sort((a, b) => b[1] - a[1]);

		console.log(
			"\nexport type %s =",
			key.slice(0, 1).toUpperCase() + key.slice(1),
		);
		for (let i = 0; i < value.length; i++) {
			const v = value[i];

			if (i >= value.length - 1) {
				console.log(`// ${v[1]} Cards\n| '${v[0]}';`);
			} else {
				console.log(`// ${v[1]} Cards\n| '${v[0]}'`);
			}
		}
	}

	console.log(`
/**
 * Hearthstone's card blueprint.
 */
export type Card = {
    id: string;
    dbfId: number;
    name: string;
    text?: string;
    flavor?: string;
    artist?: string;
    cardClass?: CardClass;
    // Collectible is either set to true, or not set at all.
    collectible?: boolean;
    cost?: number;
    mechanics?: Mechanics[];
    rarity?: Rarity;
    set: Set;
    race?: Race;
    races?: Race[];
    type: Type;
    spellSchool?: SpellSchool;
    durability?: number;
    faction?: Faction;
    // I am not sure what this is, but it is either set to true, or not set at all.
    // It might have something to do with legendaries. Maybe making sure that only 1 can be in a deck at a time.
    elite?: boolean;
    attack?: number;
    health?: number;

    howToEarn?: string;
    // All props below this line was found by a script (vcpropfinder)
    classes?: CardClass[];
    heroPowerDbfId?: number;
    referencesTags?: Mechanics[];
    targetingArrowText?: string;
    overload?: number;
    spellDamage?: number;
    collectionText?: string;
    // Has Diamond Skin is either set to true, or not set at all.
    hasDiamondSkin?: boolean;
    howToEarnGolden?: string;
    armor?: number;
    multiClassGroup?: MultiClassGroup;
    // Is mini set is either set to true, or not set at all.
    isMiniSet?: boolean;
    // This seems like it is the id (not dbfId) of the reward card.
    questReward?: string;

    // Likely part of other gamemodes.
    mercenariesRole?: string;
    mercenariesAbilityCooldown?: number;
    techLevel?: number;
    // Hide Cost is either set to true, or not set at all.
    hideCost?: boolean;
    // Hide Stats is either set to true, or not set at all.
    hideStats?: boolean;
    // Is battlegrounds pool minion is either set to true, or not set at all.
    isBattlegroundsPoolMinion?: boolean;
    battlegroundsPremiumDbfId?: number;
    battlegroundsNormalDbfId?: number;
    battlegroundsBuddyDbfId?: number;
    // Battlegrounds hero is either set to true, or not set at all.
    battlegroundsHero?: boolean;
    // Is battlegrounds buddy is either set to true, or not set at all.
    isBattlegroundsBuddy?: boolean;
    battlegroundsSkinParentId?: number;
    battlegroundsDarkmoonPrizeTurn?: number;
    countAsCopyOfDbfId?: number;
    puzzleType?: number;
};
`);
}

main();
