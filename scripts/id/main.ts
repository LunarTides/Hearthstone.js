import * as lib from "./lib.js";

// Check if your git is clean
try {
	game.functions.util.runCommand("git status --porcelain");

	console.error(
		"<yellow>WARNING: You have uncommitted changes. Please commit them before running a non-safe command.</yellow>",
	);
	// Process.exit(1);
} catch {
	// Do nothing
}

console.error(
	"<yellow>WARNING: Be careful with this script. This might break things that are dependent on ids remaining the same, like deckcodes.</yellow>",
);

console.log(
	"<green>The validate and quit commands are safe to use without issue.</green>\n",
);

enum Commands {
	Increment = "i",
	Decrement = "d",
	Validate = "v",
	Quit = "q",
}

let running = true;

while (running) {
	let func = (
		await game.input(
			"What do you want to do? ([i]ncrement, [d]ecrement, [v]alidate, [q]uit): ",
		)
	)[0] as Commands;

	if (!func) {
		await game.pause("<red>Invalid command.</red>\n");
		continue;
	}

	func = func.toLowerCase() as Commands;
	const destructive = [Commands.Increment, Commands.Decrement];

	if (destructive.includes(func)) {
		console.error(
			"<yellow>WARNING: This is a destructive action. Be careful. I heavily recommend not doing this.</yellow>\n",
		);
	}

	let startId: number;

	switch (func) {
		case "i": {
			startId = Number(await game.input("What id to start at: "));
			if (!startId) {
				await game.pause("<red>Invalid start id.</red>\n");
				break;
			}

			lib.increment(startId, true);
			break;
		}

		case "d": {
			startId = Number(await game.input("What id to start at: "));
			if (!startId) {
				await game.pause("<red>Invalid start id.</red>\n");
				break;
			}

			lib.decrement(startId, true);
			break;
		}

		case "v": {
			lib.validate(true);
			break;
		}

		case "q": {
			running = false;
			break;
		}

		default: {
			await game.pause("<red>Invalid command.</red>\n");
			break;
		}
	}

	console.log("Done.\n");
}
