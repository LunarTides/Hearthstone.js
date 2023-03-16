module.exports = {
    name: "Silverleaf Poison",
    desc: "Give your weapon \"After your hero attacks, draw a card.\"",
    mana: 1,
    class: "Rogue",
    rarity: "Common",
    set: "Forged in the Barrens",
    spellClass: "Nature",
    id: 275,

    cast(plr, game, self) {
        if (!plr.weapon) return -1;

        plr.weapon.onattack = [(plr, game, self) => {
            plr.drawCard();
        }];
    }
}
