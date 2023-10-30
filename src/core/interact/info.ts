import process from 'node:process';
import { type Player } from '@Game/internal.js';

export const INFO_INTERACT = {
    /**
     * Prints the "watermark" border
     */
    watermark(): void {
        game.interact.cls();

        const { info: INFO } = game.config;
        const VERSION_DETAIL = game.player.detailedView || game.config.general.debug ? 4 : 3;

        const WATERMARK = `HEARTHSTONE.JS V${game.functions.info.version(VERSION_DETAIL)}`;
        const BORDER = '-'.repeat(WATERMARK.length + 2);

        game.log(`|${BORDER}|`);
        game.log(`| ${WATERMARK} |`);
        game.log(`|${BORDER}|\n`);

        if (INFO.branch === 'topic' && game.config.general.topicBranchWarning) {
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

        const { info: INFO } = game.config;

        game.interact.cls();

        const VERSION = `Hearthstone.js V${game.functions.info.version(2)} | Copyright (C) 2022 | LunarTides`;
        game.log('|'.repeat(VERSION.length + 8));
        game.log(`||| ${VERSION} |||`);
        game.log('|||     This program is licensed under the GPL-3.0 license.  ' + ' '.repeat(INFO.branch.length) + '|||');
        if (disappear) {
            game.log('|||         This will disappear once you end your turn.      ' + ' '.repeat(INFO.branch.length) + '|||');
        }

        game.log('|'.repeat(VERSION.length + 8));
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
        const SUCCESS = callback();

        const MESSAGE = (SUCCESS) ? 'OK' : 'FAIL';
        process.stdout.write(`\r\u001B[K${status}...${MESSAGE}\n`);

        return SUCCESS;
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
    printPlayerStats(currentPlayer: Player): void {
        let finished = '';

        const doStat = (callback: (player: Player) => string) => {
            const PLAYER = callback(currentPlayer);
            const OPPONENT = callback(currentPlayer.getOpponent());

            if (!PLAYER && !OPPONENT) {
                return;
            }

            if (!PLAYER) {
                finished += `${OPPONENT.split(':')[0]}: <italic gray>Nothing</italic gray> | ${OPPONENT}`;
            } else if (OPPONENT) {
                finished += `${PLAYER} | ${OPPONENT}`;
            } else {
                finished += `${PLAYER} | ${PLAYER.split(':')[0]}: <italic gray>Nothing</italic gray>`;
            }

            finished += '\n';
        };

        const wallify = (text: string) => {
            const TEXT_SPLIT = game.lodash.initial(text.split('\n'));

            // Wallify the ':' in the first half
            const FIRST_HALF = TEXT_SPLIT.map(line => line.split('|')[0]);
            const FIRST_HALF_WALL = game.functions.util.createWall(FIRST_HALF, ':');

            // Wallify the ':' in the second half
            const SECOND_HALF = TEXT_SPLIT.map(line => line.split('|')[1]);
            const SECOND_HALF_WALL = game.functions.util.createWall(SECOND_HALF, ':');

            // Combine the two halves
            const NEW_TEXT = FIRST_HALF_WALL.map((line, index) => line + '|' + SECOND_HALF_WALL[index]);

            // Wallify the '|' in the final result
            const WALL = game.functions.util.createWall(NEW_TEXT, '|');

            return WALL.join('\n');
        };

        const colorIf = game.functions.color.if;
        const detail = (noDetail: string, detail: string) => currentPlayer.detailedView ? detail : noDetail;

        // Mana
        doStat(player => `Mana: <cyan>${player.mana}</cyan> / <cyan>${player.emptyMana}</cyan>`);

        // Health
        doStat(player => `Health: <red>${player.health}</red> <gray>[${player.armor}]</gray> / <red>${player.maxHealth}</red>`);

        // Deck Size
        doStat(player => `Deck Size: <yellow>${player.deck.length}</yellow> & <yellow>${player.hand.length}</yellow>`);

        // Hero Power
        doStat(player => {
            const HERO_POWER_COST = colorIf(player.canUseHeroPower, 'cyan', `{${player.hero.hpCost}}`);

            return `Hero Power: ${HERO_POWER_COST} ${detail(player.hero.displayName, player.hero.hpText)}`;
        });

        // Weapon
        doStat(player => {
            if (!player.weapon) {
                return '';
            }

            return `Weapon: ${detail(player.weapon.colorFromRarity(), game.interact.card.getReadable(player.weapon))}`;
        });

        // TODO: Add quests, secrets, etc...

        // Attack
        doStat(player => {
            // If the player doesn't have any attack, don't show the attack.
            if (player.attack <= 0) {
                return '';
            }

            return `Attack: <bright:green>${player.attack}</bright:green>`;
        });

        // Corpses
        doStat(player => {
            if (!(currentPlayer.detailedView || player.heroClass === 'Death Knight')) {
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
        for (const [PLAYER_INDEX, SIDE] of game.board.entries()) {
            const PLAYER = game.functions.util.getPlayerFromId(PLAYER_INDEX);
            const SIDE_MESSAGE = plr === PLAYER ? '----- Board (You) ------' : '--- Board (Opponent) ---';
            game.log(SIDE_MESSAGE);

            if (SIDE.length === 0) {
                game.log('<gray>Empty</gray>');
                continue;
            }

            for (const [INDEX, CARD] of SIDE.entries()) {
                game.log(game.interact.card.getReadable(CARD, INDEX + 1));
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

        for (const [INDEX, CARD] of plr.hand.entries()) {
            game.log(game.interact.card.getReadable(CARD, INDEX + 1));
        }
    },
};
