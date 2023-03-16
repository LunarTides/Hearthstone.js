module.exports = {
    name: "Tooth of Nafarian",
    desc: "Deal 2 damage. &BDiscover&R a spell from another class.",
    mana: 3,
    class: "Rogue",
    rarity: "Common",
    set: "Onyxia's Lair",
    id: 280,

    cast(plr, game, self) {
        let target = game.interact.selectTarget(`Deal ${2 + plr.spellDamage} damage.`, true);
        if (!target) return -1;

        game.functions.spellDmg(target, 2);

        let list = Object.values(game.functions.getCards());
        list = list.filter(c => game.functions.getType(c) == "Spell" && !game.functions.validateClass(plr, c));
        if (list.length <= 0) return;

        game.interact.discover("Discover a spell from another class.", list);
    }
}
