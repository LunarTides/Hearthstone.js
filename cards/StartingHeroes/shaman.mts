// Created by the Custom Card Creator

import { Blueprint } from "@Game/types.js";

export const blueprint: Blueprint = {
    name: "Shaman Starting Hero",
    displayName: "Thrall",
    desc: "Shaman starting hero",
    cost: 0,
    type: "Hero",
    classes: ["Shaman"],
    rarity: "Free",
    hpDesc: "Summon a random Totem.",
    hpCost: 2,
    uncollectible: true,
    id: 9,

    heropower(plr, game, self) {
        // The names of the cards that can be summoned
        const totemCardNames = ["Healing Totem", "Searing Totem", "Stoneclaw Totem", "Strength Totem"];
        const filteredTotemCardNames: string[] = [];

        // Filter away totem cards that is already on the player's side of the board.
        totemCardNames.forEach(name => {
            // If the board already has a totem with this name, return
            if (game.board[plr.id].some(m => m.name === name)) return

            filteredTotemCardNames.push(name);
        });

        // If there are no totem cards to summon, refund the hero power, which gives the player back their mana
        if (filteredTotemCardNames.length == 0) return game.constants.REFUND;

        // Randomly choose one of the totem cards. Get the actual card and not a copy.
        const _cardName = game.functions.randList(filteredTotemCardNames);
        if (!_cardName) throw new game.CardError("null found when randomly choosing totem card name");

        const cardName = _cardName.actual;

        // Create a card from the name.
        const card = new game.Card(cardName, plr);

        // Summon the card on the player's side of the board
        game.summonMinion(card, plr);
        return true;
    }
}
