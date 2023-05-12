module.exports = {
    name: "Combined Example 3",
    desc: "If the turn counter is an even number, gain mana equal to the turn counter (up to 10). Manathirst (7): Remove the condition. (Currently: {0})", // The things with `{...}` will be replaced in the `placeholder` function.
    mana: 0,
    type: "Spell",
    class: "Neutral",
    rarity: "Legendary",
    conditioned: ["cast"],
    uncollectible: true,

    cast(plr, game, self) {
        let turns = Math.ceil(game.turns / 2);
        if (turns > 10) turns = 10;

        plr.gainMana(turns, true);
    },

    condition(plr, game, self) {
        let turns = Math.ceil(game.turns / 2);
        if (turns > 10) turns = 10;

        let even = (turns % 2 == 0); // `turns` % 2 will always return 0 if it is an even number, and always return 1 if it is an odd number.
        let manathirst = self.manathirst(7);

        return even || manathirst;
    },

    placeholders(plr, game, self) {
        let turns = Math.ceil(game.turns / 2);
        if (turns > 10) turns = 10;

        return {0: turns};
    }
}
