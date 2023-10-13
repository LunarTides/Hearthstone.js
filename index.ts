/**
 * The entry point of the program. Acts like a hub between the tools / scripts and the game.
 * @module Runner
 */
import * as src from './src/index.js'; // Source Code
import * as dc from './tools/deckcreator.js'; // Deck Creator
import * as ccc from './tools/cardcreator/custom.js'; // Custom Card Creator
import * as vcc from './tools/cardcreator/vanilla.js'; // Vanilla Card Creator
import * as clc from './tools/cardcreator/class.js'; // Class Creator
import * as cli from './tools/cli.js'; // Command Line Interface

const watermark = () => {
	game.interact.cls();
	game.log('Hearthstone.js Runner V%s (C) 2022\n', game.functions.info.version(3));
};

function userInputLoop(prompt: string, exitCharacter: string | undefined, callback: (input: string) => void) {
	let running = true;
	while (running) {
		watermark();

		const user = game.input(prompt);
		if (!user) {
			continue;
		}

		if (game.interact.shouldExit(user) || user[0].toLowerCase() === exitCharacter?.toLowerCase()) {
			running = false;
			break;
		}

		callback(user);
	}
}

function cardCreator() {
	userInputLoop('Create a (C)ustom Card, Import a (V)anilla Card, Go (B)ack: ', 'b', input => {
		const type = input[0].toLowerCase();

		game.interact.cls();

		if (type === 'v') {
			// This is to throw an error if it can't find the vanilla cards
			game.functions.card.vanilla.getAll();

			vcc.main();
		} else if (type === 'c') {
			ccc.main();
		}
	});
}

function replay() {
	game.logWarn('<yellow>WARNING: This feature is unstable. Expect bugs.</yellow>\n');
	let path = '/logs/log-' + game.input('Path: /logs/log-');
	if (!path.endsWith('.txt')) {
		path += '.txt';
	}

	src.main(path);
}

function devmode() {
	userInputLoop('Create a (C)ard, Create a Clas(s), Enter CLI (m)ode, Go (B)ack to Normal Mode: ', 'b', input => {
		input = input[0].toLowerCase();

		switch (input) {
			case 'c': {
				cardCreator();
				break;
			}

			case 's': {
				clc.main();
				break;
			}

			case 'm': {
				cli.main(userInputLoop);
				break;
			}

			// No default
		}
	});
}

userInputLoop('(P)lay, (R)eplay, Create a (D)eck, Developer (M)ode, (E)xit: ', 'e', input => {
	input = input[0].toLowerCase();

	switch (input) {
		case 'p': {
			src.main();
			break;
		}

		case 'r': {
			replay();
			break;
		}

		case 'd': {
			dc.main();
			break;
		}

		case 'm': {
			devmode();
			break;
		}

		// No default
	}
});
