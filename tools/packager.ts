// Allows importing / exporting .hspkg files.
import { Card } from "@Game/card.ts";
import { createGame } from "@Game/game.ts";
import { randomUUID } from "node:crypto";
import { userInputLoop } from "hub.ts";
import { validate } from "scripts/id/lib.ts";

const { game } = await createGame();

async function importPackage() {
	// FIXME: Importing the same package twice breaks ids.

	await game.pause(
		"Extract and drag the folder into '/packs/. Press enter when you're done.",
	);

	const packs: string[] = [];

	await game.functions.util.searchFolder(
		"/packs",
		async (index, path, file) => {
			if (!file.parentPath.endsWith("/packs") || !file.isDirectory()) {
				return;
			}

			packs.push(file.name);
		},
	);

	console.log(packs.map((p, i) => `${i + 1}: ${p}`).join("\n"));

	const index = parseInt(await game.input(""), 10);
	if (Number.isNaN(index) || index <= 0 || index > packs.length) {
		await game.pause("Invalid index.");
		return await importPackage();
	}

	const pack = packs[index - 1];

	await game.functions.util.fs("mkdir", `/cards/Packs/${pack}`, {
		recursive: true,
	});

	// Change ids to align with latest id.
	const latestId = await Card.latestId();

	await game.functions.util.searchCardsFolder(
		async (path, content, file, index) => {
			let newContent = content;
			let fileName = file.name;

			// Only change the id of there isn't an old version of the file already exists (package upgrade).
			if (
				!(await game.functions.util.fs(
					"exists",
					`/cards/Packs/${pack}/${file.name}`,
				))
			) {
				newContent = content.replace(
					/\tid: \d+,/,
					`\tid: ${latestId + index + 1},`,
				);

				// If the file name starts with a number then a dash, replace that number with the new id.
				// This is so that the file name matches the id.
				if (/^\d+-/.test(fileName)) {
					fileName = `${latestId + index + 1}-${file.name.split("-").slice(1).join("-")}`;
				}
			}

			await game.functions.util.fs(
				"writeFile",
				`/cards/Packs/${pack}/${fileName}`,
				newContent,
			);
		},
		`/packs/${pack}`,
	);

	await validate(false, false);

	console.log(
		`<green>The pack has been imported into '/cards/Packs/${pack}'.</green>`,
	);

	const deleteConfirm = await game.prompt.yesNo(
		`Do you want to delete '/packs/${pack}'?`,
	);
	if (deleteConfirm) {
		await game.functions.util.fs("rm", `/packs/${pack}`, {
			recursive: true,
			force: true,
		});
	}
}

async function exportPackage() {
	const uuid = randomUUID();

	await game.functions.util.fs("mkdir", `/packs/${uuid}`, { recursive: true });
	await game.functions.util.searchCardsFolder(async (path, content, file) => {
		if (path.includes("/Custom")) {
			await game.functions.util.fs(
				"cp",
				path,
				game.functions.util.restrictPath(`/packs/${uuid}/${file.name}`),
			);
		}
	});

	await game.pause(
		`Done.\n\nNext steps:\n1. Check the cards in '/packs/${uuid}'. Add / remove the cards you want in the package.\n2. Compress the 'packs/${uuid}' folder.\n3. Send the compressed file to whoever you'd like.\n`,
	);
}

export async function main() {
	await userInputLoop(
		"<green>(E)xport a package</green>, <blue>(I)mport a package</blue>, <red>(B)ack</red>: ",
		"b",
		async (input) => {
			const command = input[0].toLowerCase();

			if (command === "e") {
				await exportPackage();
			} else if (command === "i") {
				await importPackage();
			}
		},
	);
}
