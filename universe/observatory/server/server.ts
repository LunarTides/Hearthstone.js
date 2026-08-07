import { createGame } from "@Game/game.ts";

await createGame(false);

if (!(await game.fs.call("exists", "/universe/universe.json"))) {
	console.log(
		"<red>The universe has not been mapped. Run the telescope first.</red>",
	);
	process.exit(1);
}

// Copy the `universe.json` file.
await game.fs.call(
	"copyFile",
	"/universe/universe.json",
	game.fs.restrictPath("/universe/observatory/client/universe.json"),
);

const worker = new Worker("./worker.ts");

while (true) {
	const message = await game.input({ message: "Hello!" });
	worker.postMessage(`msg ${message}`);
}
