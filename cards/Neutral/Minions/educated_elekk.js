module.exports = {
    name: "Educated Elekk",
    stats: [3, 4],
    desc: "Whenever a spell is played, this minion remembers it. Deathrattle: Shuffle the spells into your deck.",
    mana: 3,
    tribe: "Beast",
    class: "Neutral",
    rarity: "Epic",
    set: "Scholomance Academy",

    passive(plr, game, card, trigger) {
        if (trigger[0] == "spellsCast") {
            card.storage.push(trigger[1]);
        }
    },

    deathrattle(plr, game, card) {
        card.storage.forEach(c => {
            plr.shuffleIntoDeck(new game.Spell(c.name, plr));
        });

        card.storage = [];
    }
}