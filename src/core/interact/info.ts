import process from "node:process";
import type { Player } from "@Game/internal.js";

export const infoInteract = {
	/**
	 * Prints the "watermark" border
	 */
	printWatermark(): void {
		game.interact.cls();

		const versionDetail =
			game.player.detailedView || game.config.general.debug ? 4 : 3;

		const watermark = `HEARTHSTONE.JS V${game.functions.info.versionString(versionDetail)}`;
		const border = "-".repeat(watermark.length + 2);

		console.log("|%s|", border);
		console.log("| %s |", watermark);
		console.log("|%s|", border);

		const { branch } = game.functions.info.version();

		if (branch === "topic" && game.config.general.topicBranchWarning) {
			console.log(
				"\n<yellow>WARNING: YOU ARE ON A TOPIC BRANCH. THIS VERSION IS NOT READY.</yellow>",
			);
		}

		if (game.time.events.anniversary) {
			console.log(
				`\n<b>[${game.time.year - 2022} YEAR ANNIVERSARY! Enjoy some fun-facts about Hearthstone.js!]</b>`,
			);
		}
	},

	/**
	 * Prints some license info
	 *
	 * @param disappear If this is true, "This will disappear once you end your turn" will show up.
	 */
	printLicense(disappear = true): void {
		if (game.config.general.debug) {
			return;
		}

		const { branch } = game.functions.info.version();

		game.interact.cls();

		const version = `Hearthstone.js V${game.functions.info.versionString(2)} | Copyright (C) 2022 | LunarTides`;
		console.log("|".repeat(version.length + 8));
		console.log("||| %s |||", version);
		console.log(
			`|||     This program is licensed under the GPL-3.0 license.  ${" ".repeat(branch.length)}|||`,
		);

		if (disappear) {
			console.log(
				`|||         This will disappear once you end your turn.      ${" ".repeat(branch.length)}|||`,
			);
		}

		console.log("|".repeat(version.length + 8));
	},

	/**
	 * Shows `status...`, calls `callback`, then adds 'OK' or 'FAIL' to the end of that line depending on the result the callback
	 *
	 * @param status The status to show.
	 * @param callback The callback to call.
	 *
	 * @returns The return value of the callback.
	 */
	async withStatus(
		status: string,
		callback: () => Promise<boolean>,
	): Promise<boolean> {
		process.stdout.write(`${status}...`);
		const success = await callback();

		const message = success ? "OK" : "FAIL";
		process.stdout.write(`\r\u001B[K${status}...${message}\n`);

		return success;
	},

	/**
	 * Prints all the information you need to understand the game state
	 *
	 * @param player The player
	 */
	async printGameState(player: Player): Promise<void> {
		this.printWatermark();
		console.log();

		if (game.turn <= 2 && !game.config.general.debug) {
			this.printLicense();
			console.log();
		}

		await this.printPlayerStats(player);
		console.log();
		await this.printBoard(player);
		console.log();
		await this.printHand(player);
	},

	/**
	 * Prints the player stats.
	 */
	async printPlayerStats(currentPlayer: Player): Promise<void> {
		let finished = "";

		const doStat = async (callback: (player: Player) => Promise<string>) => {
			const player = await callback(currentPlayer);
			const opponent = await callback(currentPlayer.getOpponent());

			if (!player && !opponent) {
				return;
			}

			if (!player) {
				finished += `${opponent.split(":")[0]}: <italic gray>Nothing</italic gray> | ${opponent}`;
			} else if (opponent) {
				finished += `${player} | ${opponent}`;
			} else {
				finished += `${player} | ${player.split(":")[0]}: <italic gray>Nothing</italic gray>`;
			}

			finished += "\n";
		};

		const wallify = (text: string) => {
			const textSplit = game.lodash.initial(text.split("\n"));

			// Wallify the ':' in the first half
			const firstHalf = textSplit.map((line) => line.split("|")[0]);
			const firstHalfWall = game.functions.util.createWall(firstHalf, ":");

			// Wallify the ':' in the second half
			const secondHalf = textSplit.map((line) => line.split("|")[1]);
			const secondHalfWall = game.functions.util.createWall(secondHalf, ":");

			// Combine the two halves
			const newText = firstHalfWall.map(
				(line, index) => `${line}|${secondHalfWall[index]}`,
			);

			// Wallify the '|' in the final result
			const wall = game.functions.util.createWall(newText, "|");

			return wall.join("\n");
		};

		const colorIf = game.functions.color.if;
		const detail = (noDetail: string, detail: string) =>
			currentPlayer.detailedView ? detail : noDetail;

		// Mana
		await doStat(
			async (player) =>
				`Mana: <cyan>${player.mana}</cyan> / <cyan>${player.emptyMana}</cyan>`,
		);

		// Health
		await doStat(
			async (player) =>
				`Health: <red>${player.health}</red> <gray>[${player.armor}]</gray> / <red>${player.maxHealth}</red>`,
		);

		// Deck Size
		await doStat(
			async (player) =>
				`Deck Size: <yellow>${player.deck.length}</yellow> & <yellow>${player.hand.length}</yellow>`,
		);

		// Hero Power
		await doStat(async (player) => {
			const heroPowerCost = colorIf(
				player.canUseHeroPower(),
				"cyan",
				`{${player.hero.heropower?.cost}}`,
			);

			return `Hero Power: ${heroPowerCost} ${player.hero.name}`;
		});

		// Weapon
		await doStat(async (player) => {
			if (!player.weapon) {
				return "";
			}

			return `Weapon: ${detail(player.weapon.colorFromRarity(), await player.weapon.readable())}`;
		});

		// TODO: Add quests, secrets, etc...

		// Attack
		await doStat(async (player) => {
			// If the player doesn't have any attack, don't show the attack.
			if (player.attack <= 0) {
				return "";
			}

			return `Attack: <bright:green>${player.attack}</bright:green>`;
		});

		// Corpses
		await doStat(async (player) => {
			if (player.corpses <= 0 || !player.canUseCorpses()) {
				return "";
			}

			return `Corpses: <gray>${player.corpses}</gray>`;
		});

		console.log(wallify(finished));

		if (game.time.events.anniversary) {
			console.log(
				"<i>[Anniversary: The code for the stats above was rewritten 3 times in total]</i>",
			);
		}
	},

	/**
	 * Prints the board for a specific player.
	 */
	async printBoard(player: Player): Promise<void> {
		for (const plr of [game.player1, game.player2]) {
			const sideMessage =
				plr === player
					? "----- Board (You) ------"
					: "--- Board (Opponent) ---";
			console.log(sideMessage);

			if (plr.board.length === 0) {
				console.log("<gray>Empty</gray>");
				continue;
			}

			for (const [index, card] of plr.board.entries()) {
				console.log(await card.readable(index + 1));
			}
		}

		console.log("------------------------");
	},

	/**
	 * Prints the hand of the specified player.
	 */
	async printHand(player: Player): Promise<void> {
		console.log("--- %s (%s)'s Hand ---", player.name, player.heroClass);
		// Add the help message
		console.log(
			"([index] <cyan>{Cost}</cyan> <b>Name</b> <bright:green>[attack / health]</bright:green> <yellow>(type)</yellow>)\n",
		);

		for (const [index, card] of player.hand.entries()) {
			console.log(await card.readable(index + 1));
		}
	},
};
