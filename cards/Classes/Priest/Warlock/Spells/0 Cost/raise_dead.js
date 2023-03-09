module.exports = {
    name: "Raise Dead",
    desc: "Deal 3 damage to your hero. Return two friendly minions that died this game to your hand.",
    mana: 0,
    class: "Priest / Warlock",
    rarity: "Common",
    set: "Scholomance Academy",
    spellClass: "Shadow",
    id: 230,

    cast(plr, game, self) {
        game.functions.spellDmg(plr, 3);

        let grave = game.graveyard[plr.id];

        for (let i = 0; i < 2; i++) {
            let minion = game.functions.randList(grave);
            if (!minion) continue;

            game.functions.remove(grave, minion);

            plr.addToHand(minion);
        }
    }
}
