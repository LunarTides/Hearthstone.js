/* eslint-disable @typescript-eslint/naming-convention */
import {type Blueprint, type CardType} from '@Game/types.js';

// These are the required fields for all card types.
const requiredFieldsTable: {[x in CardType]: string[]} = {
	Minion: ['stats', 'tribe'],
	Spell: ['spellSchool'],
	Weapon: ['stats'],
	Hero: ['hpText', 'hpCost'],
	Location: ['durability', 'cooldown'],
	Undefined: [],
};

/**
 * Validates a blueprint
 *
 * @returns Success / Error message
 */
export function validateBlueprint(blueprint: Blueprint): string | boolean {
	// We trust the typescript compiler to do most of the work for us, but the type specific code is handled here.
	const required = requiredFieldsTable[blueprint.type];

	const unwanted = Object.keys(requiredFieldsTable);
	game.functions.util.remove(unwanted, blueprint.type);
	game.functions.util.remove(unwanted, 'Undefined');

	let result: string | boolean = true;
	for (const field of required) {
		// Field does not exist
		if (!blueprint[field as keyof Blueprint]) {
			result = `<bold>'${field}' DOES NOT</bold> exist for that card.`;
		}
	}

	for (const key of unwanted) {
		const fields = requiredFieldsTable[key as CardType];

		for (const field of fields) {
			// We already require that field. For example, both minions and weapons require stats
			if (required.includes(field)) {
				continue;
			}

			// We have an unwanted field

			if (blueprint[field as keyof Blueprint]) {
				result = `<bold>${field} SHOULD NOT</bold> exist on card type ${blueprint.type}.`;
			}
		}
	}

	return result;
}
