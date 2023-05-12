module.exports = {
    name: "Placeholder Example",
    desc: "Battlecry: Gain mana equal to the turn counter. (Currently {0}, {1}, {0}, {next thing is} {10}, {placeholder without replacement})", // The things with `{...}` will be replaced in the `placeholder` function.
    mana: 0,
    type: "Spell",
    class: "Neutral",
    rarity: "Free",
    uncollectible: true,

    cast(plr, game, self) {
        // The turn counter goes up at the beginning of each player's turn, so on player 1's turn, the turn counter will almost[*1] always be an odd number. So we devide the number by 2 and round the result up.
        // 1; Unless the player somehow gets 2 turns in a row.
        let turns = Math.ceil(game.turns / 2);

        plr.gainMana(turns, true);
    },

    placeholders(plr, game, self) {
        // all occurances of `{0}` will be replaced by the value in `game.turns`
        // all `{1}` will be replaced by 'haha lol'
        // all `{next thing is}` will be replaced by 'The next thing is:'
        // the `{placeholder without replacement}` doesn't have a replacement, so it will remain '{placeholder without replacement}'
        let turns = Math.ceil(game.turns / 2);

        return {0: turns, 1: "haha lol", 10: "test", "next thing is": "The next thing is:"};
    }
}
