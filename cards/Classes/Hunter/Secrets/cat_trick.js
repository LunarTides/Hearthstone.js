module.exports = {
    name: "Cat Trick",
    desc: "Secret: After your opponent casts a spell, summon a 4/2 Panther with Stealth.",
    mana: 2,
    class: "Hunter",
    rarity: "Rare",
    set: "One Night in Karazhan",
    id: 218,

    cast(plr, game, self) {
        game.functions.addQuest("Secret", plr, self, "PlayCard", 1, (card, _, turn) => {
            if (card.type != "Spell") return;

            let panther = new game.Card("Cat Trick Panther", plr);
            game.summonMinion(panther, plr);

            return true;
        }, null, true);
    }
}
