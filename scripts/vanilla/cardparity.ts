/**
 * The card parity script.
 * @module Card Parity
 */

import {type Card, createGame} from '../../src/internal.js';
import {type Blueprint, type VanillaCard} from '../../src/types.js';

const {game, player1, player2} = createGame();

function main() {
	const vanillaCards = game.functions.card.vanilla.getAll();

	const filteredVanillaCards = game.functions.card.vanilla.filter(vanillaCards, false, false);
	const customCards = game.functions.card.getAll(false);

	for (const custom of customCards) {
		// Find the equivalent vanilla card
		let vanilla = filteredVanillaCards.find(vanilla => (
			vanilla.name.toLowerCase() === custom.displayName.toLowerCase()
                && vanilla.type.toLowerCase() === custom.type.toLowerCase()
		));

		// There is no vanilla version of that card.
		if (!vanilla) {
			continue;
		}

		for (const ent of Object.entries(custom)) {
			// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
			const [key, value] = ent;

			// HACK: For some reason, typescript thinks that vanilla can be undefined
			vanilla = vanilla!;

			if (key === 'stats') {
				// eslint-disable-next-line @typescript-eslint/no-unsafe-call
				check('attack', value[0].toString(), vanilla, custom);
				// eslint-disable-next-line @typescript-eslint/no-unsafe-call
				check('health', value[1].toString(), vanilla, custom);
				continue;
			}

			vanilla.text = vanilla.text?.replaceAll('\n', ' ');
			vanilla.text = vanilla.text?.replaceAll('[x]', '');

			check(key, value, vanilla, custom);
		}
	}

	function check(key: string, value: any, vanilla: VanillaCard, card: Card) {
		const ignore = ['id', 'set', 'name', 'rarity', 'type'];

		const table: {[key in keyof Blueprint]?: keyof VanillaCard} = {
			text: 'text',
		};

		let vanillaValue: any = key as keyof VanillaCard;
		if (!vanillaValue) {
			vanillaValue = table[key as keyof Blueprint];
		}

		vanillaValue = vanilla[vanillaValue as keyof VanillaCard];

		if (!vanillaValue || ignore.includes(key)) {
			return;
		}

		// eslint-disable-next-line @typescript-eslint/no-unsafe-call
		if (value.toString().toLowerCase() === vanillaValue?.toString().toLowerCase()) {
			return;
		}

		game.log('Card outdated!');
		game.log(`Name: ${card.name}`);
		game.log(`Local: "${key}: ${value}"`);
		game.log(`New:   "${key}: ${vanillaValue}"\n`);
	}
}

main();
