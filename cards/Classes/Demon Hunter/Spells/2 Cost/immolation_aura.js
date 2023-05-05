module.exports = {
    name: "Immolation Aura",
    desc: "Deal 1 damage to all minions twice.",
    mana: 2,
    type: "Spell",
    class: "Demon Hunter",
    rarity: "Common",
    set: "Ashes of Outland",
    spellClass: "Fel",
    id: 201,

    cast(plr, game, self) {
        const doDamage = () => {
            game.board.forEach(p => {
                p.forEach(m => {
                    game.functions.spellDmg(m, 1);
                });
            });
        }

        doDamage();
        doDamage();
    }
}
