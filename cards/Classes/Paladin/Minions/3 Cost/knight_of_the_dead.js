module.exports = {
    name: "Knight of the Dead",
    stats: [5, 5],
    desc: "&BBattlecry:&R Deal 5 damage to your hero. &BManathirst (7):&R Restore 5 Health to your hero instead.",
    mana: 3,
    tribe: "Undead",
    class: "Paladin",
    rarity: "Common",
    set: "Return to Naxxramas",
    id: 260,

    battlecry(plr, game, self) {
        let manathirst = self.manathirst(7);
        
        if (manathirst) plr.addHealth(5);
        else game.attack(5, plr);
    }
}
