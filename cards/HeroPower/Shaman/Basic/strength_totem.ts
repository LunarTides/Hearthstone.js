// Created by Hand (before the Card Creator Existed)

import { Blueprint } from "@Game/types.js";

export const blueprint: Blueprint = {
    name: "Strength Totem",
    stats: [0, 2],
    text: "At the end of your turn, give another friendly minion +1 Attack.",
    cost: 1,
    type: "Minion",
    tribe: "Totem",
    classes: ["Shaman"],
    rarity: "Free",
    uncollectible: true,
    id: 18,

    passive(plr, self, key, val) {
        // At the end of your turn, give another friendly minion +1 Attack.
        
        // Only continue if the event that triggered this is the EndTurn event, and the player that triggered the event is this card's owner.
        if (!(key === "EndTurn" && game.player === plr)) return;

        // The list that to choose from. Remove this minion from the list
        let board = game.board[plr.id].filter(card => card.type === "Minion");
        game.functions.remove(board, self);

        // Choose the random minion
        const minion = game.lodash.sample(board);
        if (!minion) return;

        // Give that minion +1 Attack
        minion.addStats(1, 0);
    },

    test(plr, self) {
        const assert = game.functions.assert;

        // Summon 5 Sheep with 2 max health.
        for (let i = 0; i < 5; i++) {
            const card = new game.Card("Sheep", plr);
            game.summonMinion(card, plr);
        }

        const checkSheepAttack = (shouldBeMore: boolean) => {
            return game.board[plr.id].filter(card => card.name === "Sheep").some(card => card.getHealth() === 1 && ((shouldBeMore && card.getAttack() > 1) || (!shouldBeMore && card.getAttack() === 1)));
        }

        // Summon this minion. All sheep should have 1 attack.
        game.summonMinion(self, plr);
        assert(() => checkSheepAttack(false));

        // Broadcast a dummy event. All sheep should still have 1 attack.
        game.events.broadcastDummy(plr);
        assert(() => checkSheepAttack(false));

        // Check this 50 times
        for (let i = 0; i < 50; i++) {
            // Reset the players faigue to 0 to prevent them from dying
            plr.fatigue = 0;
            plr.getOpponent().fatigue = 0;

            game.endTurn();

            // At least 1 sheep should have more than 1 attack.
            assert(() => checkSheepAttack(true));
            // This card should not get more attack.
            assert(() => self.getAttack() === self.blueprint.stats?.[0]);
            
            game.endTurn();
        }
    }
}
