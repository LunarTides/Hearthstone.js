// Created by Hand

import { Blueprint } from "../../../src/types.js";

const blueprint: Blueprint = {
    name: "Placeholder Example",

    // The things with `{...}` will be replaced in the `placeholder` function.
    desc: "Battlecry: Gain mana equal to the turn counter. (Currently {0}, {1}, {0}, {next thing is} {10}, {placeholder without replacement})",

    mana: 0,
    type: "Spell",
    classes: ["Neutral"],
    rarity: "Free",
    uncollectible: true,
    id: 54,

    cast(plr, game, self) {
        // The turn counter goes up at the beginning of each player's turn.
        // So we devide the number by 2 and round the result up in order to get a more traditional turn count.
        let turns = Math.ceil(game.turns / 2);

        plr.gainMana(turns);
    },

    // This function will be run every tick, and will replace the placeholders in the description with this function's return value.
    placeholders(plr, game, self) {
        // all occurances of `{0}` will be replaced by the value in `game.turns`
        // all `{1}` will be replaced by 'haha lol'
        // all `{next thing is}` will be replaced by 'The next thing is:'
        // the `{placeholder without replacement}` doesn't have a replacement, so it will remain '{placeholder without replacement}'
        let turns = Math.ceil(game.turns / 2);

        // Here we use static placeholders. Static placeholders are placeholders that don't change. For example, `{1}` here is a static placeholder since you can just add `haha lol`
        // to the description and it wouldn't change anything.
        // The use of static placeholders is discouraged, but we'll use them for demonstration purposes.
        return {0: turns, 1: "haha lol", 10: "test", "next thing is": "The next thing is:"};
    }
}

export default blueprint;
