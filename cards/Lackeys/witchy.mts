// Created by Hand (before the Card Creator Existed)

import { Card } from "../../src/internal.js";
import { Blueprint } from "../../src/types.js";

const blueprint: Blueprint = {
    name: "Witchy Lackey",
    stats: [1, 1],
    desc: "Battlecry: Transform a friendly minion into one that costs (1) more.",
    mana: 1,
    type: "Minion",
    tribe: "None",
    classes: ["Neutral"],
    rarity: "Free",
    uncollectible: true,
    id: 28,

    battlecry(plr, game, self) {
        // Transform a friendly minion into one that costs (1) more.

        // Ask the user which minion to transform
        let target = game.interact.selectCardTarget("Transform a friendly minion into one that costs (1) more.", self, "friendly");

        // If no target was selected, refund
        if (!target) return game.constants.REFUND;

        // There isn't any cards that cost more than 10, so refund
        if (target.mana >= 10) return game.constants.REFUND;

        // Filter minions that cost (1) more than the target
        let minions = game.functions.getCards().filter(card => {
            if (!target) throw new Error("Target is undefined!");

            return card.type === "Minion" && card.mana === target.mana + 1
        });

        // Choose a random minion from the filtered list. Use the actual and not a copy, since a copied blueprint is useless.
        let rand = game.functions.randList(minions).actual;

        // Create the card
        const card = new game.Card(rand.name, plr);

        // Destroy the target and summon the new minion in order to get the illusion that the card was transformed
        target.destroy();

        // Summon the card to the player's side of the board
        game.summonMinion(card, plr);
        return true;
    }
}

export default blueprint;
