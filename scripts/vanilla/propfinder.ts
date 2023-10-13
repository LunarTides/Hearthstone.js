/**
 * @module Vanilla Card Property Finder
 */

import {createGame} from '../../src/internal.js';

const {game, player1, player2} = createGame();

const props: Record<string, [string, number]> = {};
const types: Record<string, number> = {};

function main() {
	const vanillaCards = game.functions.card.vanilla.getAll();

	for (const vanillaCard of vanillaCards) {
		for (const ent of Object.entries(vanillaCard)) {
			const [key, value] = ent;

			if (Object.keys(props).includes(key)) {
				const storedType = props[key][0];
				if (storedType !== typeof value) {
					game.logWarn('<yellow>Discrepancy found. Stored type: %s, Found type %s.</yellow>', storedType, typeof value);
				}

				props[key][1]++;
				continue;
			}

			props[key] = [typeof value, 1];
		}

		if (Object.keys(types).includes(vanillaCard.type)) {
			types[vanillaCard.type]++;
			continue;
		}

		types[vanillaCard.type] = 1;
	}

	game.log('<b>TYPES:</b>');
	game.log(types);
	game.log('<b>PROPS:</b>');
	game.log(props);
}

main();
