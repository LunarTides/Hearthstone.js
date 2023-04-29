module.exports = {
    name: "Defile",
    desc: "Deal 1 damage to all minions. If any die, cast this again.",
    mana: 2,
    type: "Spell",
    class: "Warlock",
    rarity: "Rare",
    set: "Knights of the Frozen Throne",
    spellClass: "Shadow",
    id: 294,

    cast(plr, game, self) {
        let died = false;

        game.board.forEach(p => {
            p.forEach(m => {
                game.functions.spellDmg(m, 1);

                if (m.getHealth() <= 0) died = true;
            });
        });

        if (died) self.activate("cast");
    }
}
