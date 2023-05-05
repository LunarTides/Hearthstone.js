module.exports = {
    name: "Backfire",
    desc: "Draw 3 cards. Deal 3 damage to your hero.",
    mana: 3,
    type: "Spell",
    class: "Warlock",
    rarity: "Common",
    set: "Darkmoon Races",
    spellClass: "Fire",
    id: 292,

    cast(plr, game, self) {
        for (let i = 0; i < 3; i++) plr.drawCard();
        game.attack(3, plr);
    }
}
