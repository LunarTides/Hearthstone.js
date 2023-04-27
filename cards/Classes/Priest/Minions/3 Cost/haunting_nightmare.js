module.exports = {
    name: "Haunting Nightmare",
    desc: "&BDeathrattle:&R Haunt a card in your hand. When you play it, summon a 4/3 Soldier.",
    mana: 3,
    tribe: "Undead",
    class: "Priest",
    rarity: "Epic",
    set: "March of the Lich King",
    stats: [4, 3],
    id: 240,

    deathrattle(plr, game, self) {
        // Choose a card
        let card;
        let failsafe = 100;

        do {
            card = game.functions.randList(plr.hand, false);
            failsafe--;
        } while (!card && failsafe > 0);

        if (!card && failsafe == 0) return; // If a card wasn't chosen after 100 attempts, cancel the deathrattle.

        if (card.desc == "") card.desc = "This card is Haunted".gray;
        else card.desc += " (This card is Haunted)".gray;

        game.functions.addEventListener("PlayCard", (key, val) => {
            return val == card;
        }, () => {
            // The player played the haunted card
            let minion = new game.Card("Haunting Nightmare Soldier", plr);
            game.summonMinion(minion, plr);

            return true;
        }, 1);
    }
}
