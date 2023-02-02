module.exports = {
    name: "Frozen Buckler",
    desc: "Gain 10 Armor. At the start of your next turn, lose 5 Armor.",
    mana: 2,
    class: "Warrior",
    rarity: "Epic",
    set: "Fractured in Alterac Valley",
    spellClass: "Frost",
    id: 111,

    cast(plr, game, self) {
        plr.armor += 10;

        self.storage.push(game.passives.push((game, trigger) => {
            if (!self.passiveCheck(trigger, "turnStarts")) return;
            if (game.player == plr) return;

            plr.armor -= 5;
            game.passives.splice(self.storage[0] - 1, 1);
        })); 
    }
}
