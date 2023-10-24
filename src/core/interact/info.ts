import process from 'node:process';
import { type Player } from '@Game/internal.js';

export const infoInteract = {
    /**
     * Prints the "watermark" border
     */
    watermark(): void {
        game.interact.cls();

        const { info } = game.config;
        const versionDetail = game.player.detailedView || game.config.general.debug ? 4 : 3;

        const watermarkString = `HEARTHSTONE.JS V${game.functions.info.version(versionDetail)}`;
        const border = '-'.repeat(watermarkString.length + 2);

        game.log(`|${border}|`);
        game.log(`| ${watermarkString} |`);
        game.log(`|${border}|\n`);

        if (info.branch === 'topic' && game.config.general.topicBranchWarning) {
            game.log('<yellow>WARNING: YOU ARE ON A TOPIC BRANCH. THIS VERSION IS NOT READY.</yellow>\n');
        }
    },

    /**
     * Prints some license info
     *
     * @param disappear If this is true, "This will disappear once you end your turn" will show up.
     */
    license(disappear = true): void {
        if (game.config.general.debug) {
            return;
        }

        const { info } = game.config;

        game.interact.cls();

        const version = `Hearthstone.js V${game.functions.info.version(2)} | Copyright (C) 2022 | LunarTides`;
        game.log('|'.repeat(version.length + 8));
        game.log(`||| ${version} |||`);
        game.log('|||     This program is licensed under the GPL-3.0 license.  ' + ' '.repeat(info.branch.length) + '|||');
        if (disappear) {
            game.log('|||         This will disappear once you end your turn.      ' + ' '.repeat(info.branch.length) + '|||');
        }

        game.log('|'.repeat(version.length + 8));
    },

    /**
     * Shows `status...`, calls `callback`, then adds 'OK' or 'FAIL' to the end of that line depending on the result the callback
     *
     * @param status The status to show.
     * @param callback The callback to call.
     *
     * @returns The return value of the callback.
     */
    withStatus(status: string, callback: () => boolean): boolean {
        process.stdout.write(`${status}...`);
        const success = callback();

        const message = (success) ? 'OK' : 'FAIL';
        process.stdout.write(`\r\u001B[K${status}...${message}\n`);

        return success;
    },

    /**
     * Prints all the information you need to understand the game state
     *
     * @param plr The player
     */
    showGame(plr: Player): void {
        this.watermark();
        if (game.turns <= 2) {
            this.license();
        }

        this.printPlayerStats(plr);
        game.log();
        this.printBoard(plr);
        game.log();
        this.printHand(plr);
    },

    /**
     * Prints the player stats.
     */
    printPlayerStats(plr: Player): void {
        let finished = '';

        const doStat = (callback: (player: Player) => string) => {
            const player = callback(plr);
            const opponent = callback(plr.getOpponent());

            if (!player && !opponent) {
                return;
            }

            if (!player) {
                finished += `${opponent.split(':')[0]}: <italic gray>Nothing</italic gray> | ${opponent}`;
            } else if (opponent) {
                finished += `${player} | ${opponent}`;
            } else {
                finished += `${player} | ${player.split(':')[0]}: <italic gray>Nothing</italic gray>`;
            }

            finished += '\n';
        };

        const wallify = (text: string) => {
            const textSplit = game.lodash.initial(text.split('\n'));

            // Wallify the ':' in the first half
            const firstHalf = textSplit.map(line => line.split('|')[0]);
            const firstHalfWall = game.functions.util.createWall(firstHalf, ':');

            // Wallify the ':' in the second half
            const secondHalf = textSplit.map(line => line.split('|')[1]);
            const secondHalfWall = game.functions.util.createWall(secondHalf, ':');

            // Combine the two halves
            const newText = firstHalfWall.map((line, index) => line + '|' + secondHalfWall[index]);

            // Wallify the '|' in the final result
            const wall = game.functions.util.createWall(newText, '|');

            return wall.join('\n');
        };

        // Mana
        doStat((player: Player) => `Mana: <cyan>${player.mana}</cyan> / <cyan>${player.emptyMana}</cyan>`);

        // Health
        doStat((player: Player) => `Health: <red>${player.health}</red> / <red>${player.maxHealth}</red>`);

        // Deck Size
        doStat((player: Player) => `Deck Size: <yellow>${player.deck.length}</yellow>`);

        // Weapon
        doStat((player: Player) => {
            if (!player.weapon) {
                return '';
            }

            if (plr.detailedView) {
                return `Weapon: ${game.interact.card.getReadable(player.weapon)}`;
            }

            return `Weapon: ${game.functions.color.fromRarity(player.weapon.displayName, player.weapon.rarity)}`;
        });

        // TODO: Add quests, secrets, etc...

        // Attack
        doStat((player: Player) => {
            // If the player doesn't have any attack, don't show the attack.
            if (player.attack <= 0) {
                return '';
            }

            return `Attack: <bright:green>${player.attack}</bright:green>`;
        });

        // Corpses
        doStat((player: Player) => {
            if (!(plr.detailedView || player.heroClass === 'Death Knight')) {
                return '';
            }

            return `Corpses: <gray>${player.corpses}</gray>`;
        });

        game.log(wallify(finished));
    },

    /**
     * Prints the board for a specific player.
     */
    printBoard(plr: Player): void {
        for (const [plrId, side] of game.board.entries()) {
            const player = game.functions.util.getPlayerFromId(plrId);
            const sideMessage = plr === player ? '----- Board (You) ------' : '--- Board (Opponent) ---';
            game.log(sideMessage);

            if (side.length === 0) {
                game.log('<gray>Empty</gray>');
                continue;
            }

            for (const [index, card] of side.entries()) {
                game.log(game.interact.card.getReadable(card, index + 1));
            }
        }

        game.log('------------------------');
    },

    /**
     * Prints the hand of the specified player.
     */
    printHand(plr: Player): void {
        game.log(`--- ${plr.name} (${plr.heroClass})'s Hand ---`);
        // Add the help message
        game.log('([id] <cyan>{Cost}</cyan> <b>Name</b> <bright:green>[attack / health]</bright:green> <yellow>(type)</yellow>)\n');

        for (const [index, card] of plr.hand.entries()) {
            game.log(game.interact.card.getReadable(card, index + 1));
        }
    },
};
