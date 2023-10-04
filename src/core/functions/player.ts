import { Target } from "@Game/types.js";
import { Card, Player } from "../../internal.js";

export const playerFunctions = {
    /**
     * Retrieves the player corresponding to the given id.
     * 0 is Player 1.
     * 1 is Player 2.
     *
     * @param id The id of the player - 1.
     * @return The player
     */
    getFromId(id: number): Player {
        if (id === 0) return game.player1;
        else return game.player2;
    },

    /**
     * Returns true if the `plr`'s deck has no duplicates.
     *
     * @param plr The player to check
     *
     * @returns Highlander
     */
    highlander(plr: Player): boolean {
        const deck = plr.deck.map(c => c.name);

        return (new Set(deck)).size == deck.length;
    },
    
    /**
     * Calls `callback` on all `plr`'s targets, including the player itself.
     *
     * @param plr The player
     * @param callback The callback to call
     * 
     * @returns Success
     */
    doTargets(plr: Player, callback: (target: Target) => void): boolean {
        game.board[plr.id].forEach(m => {
            callback(m);
        });

        callback(plr);

        return true;
    },
    
    /**
     * Mulligans the cards from input. Read `interact.mulligan` for more info.
     *
     * @param plr The player who mulligans
     * @param input The ids of the cards to mulligan
     *
     * @returns The cards mulligan'd
     */
    mulligan(plr: Player, input: string): Card[] | TypeError {
        if (!parseInt(input)) return new TypeError("Can't parse `input` to int");

        const cards: Card[] = [];
        const mulligan: Card[] = [];

        input.split("").forEach(c => mulligan.push(plr.hand[parseInt(c) - 1]));

        plr.hand.forEach(c => {
            if (!mulligan.includes(c) || c.name == "The Coin") return;

            game.functions.util.remove(mulligan, c);
            
            let unsuppress = game.functions.event.suppress("DrawCard");
            plr.drawCard();
            unsuppress();

            unsuppress = game.functions.event.suppress("AddCardToDeck");
            plr.shuffleIntoDeck(c);
            unsuppress();

            game.functions.util.remove(plr.hand, c);

            cards.push(c);
        });

        return cards;
    },
}
