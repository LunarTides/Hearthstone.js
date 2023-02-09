module.exports = {
    name: "Poison Seeds",
    desc: "Destroy all minions and summon 2/2 Treants to replace them.",
    mana: 4,
    class: "Druid",
    rarity: "Common",
    set: "Naxxramas",
    spellClass: "Nature",
    id: 145,

    cast(plr, game, self) {
        game.board.forEach(p => {
            p.forEach(m => {
                m.kill();

                let treant = new game.Card("Poison Seeds Treant", m.plr);
                game.summonMinion(treant, m.plr);
            });
        });
    }
}
