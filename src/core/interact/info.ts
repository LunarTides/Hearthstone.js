import process from 'node:process';
import { type Player } from '@Game/internal.js';

export const infoInteract = {
    /**
     * Prints the "watermark" border
     */
    printName(): void {
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
    printLicense(disappear = true): void {
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
     * Shows `status`..., calls `callback`, then adds 'OK' or 'FAIL' to the end of that line depending on the result the callback
     *
     * @param status The status to show.
     * @param callback The callback to call.
     *
     * @returns The return value of the callback. If the callback didn't explicitly return false then it was successful.
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
    printAll(plr: Player): void {
        this.printName();
        if (game.turns <= 2) {
            this.printLicense();
        }

        this.printPlayerStats(plr);
        game.log();
        this.printBoard(plr);
        game.log();
        this.printHand(plr);
    },

    printPlayerStats(plr: Player): void {
        // TODO: Rewrite this... again... #326
        const opponent = plr.getOpponent();

        let finished = '';
        const finishedPlayers: string[] = [];
        let totalTweak = 0;

        const doStatPt1 = (player: Player, callback: (player: Player) => [string, number]): [string[], number] => {
            let [stat, tweak] = callback(player);
            stat = game.functions.color.fromTags(stat);

            if (!stat) {
                return [[''], 0];
            }

            if (!finishedPlayers[player.id]) {
                finishedPlayers[player.id] = '';
            }

            finishedPlayers[player.id] += `${stat}\n`;

            const split = finishedPlayers[player.id].split('\n');
            game.functions.util.remove(split, '');

            return [game.functions.util.createWall(split, ':'), tweak];
        };

        const doStat = (callback: (player: Player) => [string, number]) => {
            const [playerWall, playerTweak] = doStatPt1(plr, callback);
            const [opponentWall, opponentTweak] = doStatPt1(opponent, callback);

            if (playerWall[0] === '') {
                return;
            }

            finished = '';
            for (const [index, line] of playerWall.entries()) {
                finished += `${line} | ${opponentWall[index]}\n`;
            }

            const finishedSplit = finished.split('\n');
            game.functions.util.remove(finishedSplit, '');

            const finishedWall = game.functions.util.createWall(finishedSplit, '|');
            for (const [index, line] of finishedWall.entries()) {
                let p = line.split('|')[0];
                let o = line.split('|')[1];

                // Remove `playerTweak` amount of spaces from the left side of `|`, and remove `opponentTweak` amount of spaces from the right side of `|`
                p = p.replace(new RegExp(` {${playerTweak + totalTweak}}`), '');
                o = o.replace(new RegExp(` {${opponentTweak + totalTweak}}`), '');

                finishedWall[index] = `${p} | ${o}`;
            }

            totalTweak += playerTweak;

            finished = `${finishedWall.join('\n')}`;
        };

        // Mana
        doStat((player: Player) => [`Mana: <cyan>${player.mana}</cyan> / <cyan>${player.emptyMana}</cyan>`, 0]);

        // Health
        doStat((player: Player) => [`Health: <red>${player.health}</red> / <red>${player.maxHealth}</red>`, 0]);

        // Deck Size
        doStat((player: Player) =>
        // I don't really know what is going on here, but this is what i found so far:
        // The 10 is because this is after a `number / maxNumber` but this here is just a `number`.
            [`Deck Size: <yellow>${player.deck.length}</yellow>`, 10],
        );

        // TODO: Add weapon
        // TODO: Add quests, secrets, etc...

        // Attack
        doStat((player: Player) => {
            // If no players have any attack, don't show the attack.
            if (game.player1.attack <= 0 && game.player2.attack <= 0) {
                return ['', 0];
            }

            return [`Attack: <bright:green>${player.attack}</bright:green>`, 0];
        });

        // Corpses
        doStat((player: Player) => {
            if (!plr.detailedView || plr.heroClass !== 'Death Knight') {
                return ['', 0];
            }

            return [`Corpses: <gray>${player.corpses}</gray>`, 0];
        });

        game.log(finished);
    },

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

    printHand(plr: Player): void {
        game.log(`--- ${plr.name} (${plr.heroClass})'s Hand ---`);
        // Add the help message
        game.log('([id] <cyan>{Cost}</cyan> <b>Name</b> <bright:green>[attack / health]</bright:green> <yellow>(type)</yellow>)\n');

        for (const [index, card] of plr.hand.entries()) {
            game.log(game.interact.card.getReadable(card, index + 1));
        }
    },
};
