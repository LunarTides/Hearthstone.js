module.exports = {
    name: "Petting Zoo",
    desc: "Summon a 3/3 Strider. Repeat for each Secret you control.",
    mana: 3,
    type: "Spell",
    class: "Hunter",
    rarity: "Rare",
    set: "Madness at the Darkmoon Faire",
    id: 227,

    cast(plr, game, self) {
        let strider = new game.Card("Darkmoon Strider", plr);

        game.summonMinion(strider, plr);

        for (let i = 0; i < plr.secrets.length; i++) {
            strider = new game.Card("Darkmoon Strider", plr);

            game.summonMinion(strider, plr);
        }
    }
}
