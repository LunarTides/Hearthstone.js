module.exports = {
    name: "Adapt Helper",
    desc: "&BAdapt&R a minion. (This card does not work by itself)",
    mana: 0,
    type: "Spell",
    class: "Neutral",
    rarity: "Free",
    uncollectible: true,

    adapt(plr, game, self, minion, prompt = "Choose One:", _values = []) {
        /**
         * Asks the user a "prompt" and show 3 choices for the player to choose, and do something to the minion based on the choice
         * 
         * @param {Card} minion The minion to adapt
         * @param {string} prompt [default="Choose One:"] The prompt to ask the user
         * 
         * @returns {string} The name of the adapt chosen. See the first values of possible_cards
         */

        if (!minion) return;

        game.interact.printAll(plr);

        let possible_cards = [
            ["Crackling Shield", "Divine Shield"],
            ["Flaming Claws", "+3 Attack"],
            ["Living Spores", "Deathrattle: Summon two 1/1 Plants."],
            ["Lightning Speed", "Windfury"],
            ["Liquid Membrane", "Can't be targeted by spells or Hero Powers."],
            ["Massive", "Taunt"],
            ["Volcanic Might", "+1/+1"],
            ["Rocky Carapace", "+3 Health"],
            ["Shrouding Mist", "Stealth until your next turn."],
            ["Poison Spit", "Poisonous"]
        ];
        let values = _values;

        if (values.length == 0) {
            for (let i = 0; i < 3; i++) {
                let c = game.functions.randList(possible_cards);

                values.push(c);
                game.functions.remove(possible_cards, c);
            }
        }

        let p = `\n${prompt}\n[\n`;

        values.forEach((v, i) => {
            // Check for a TypeError and ignore it
            try {
                p += `${i + 1}: ${v[0]}; ${v[1]},\n`;
            } catch (e) {}
        });

        p = p.slice(0, -2);
        p += "\n] ";

        let choice = game.input(p);
        if (!parseInt(choice)) {
            game.input("Invalid choice!\n".red);
            return self.activate("adapt", minion, prompt, values);
        }

        if (parseInt(choice) > 3) return self.activate("adapt", minion, prompt, values);

        choice = values[parseInt(choice) - 1][0];

        switch (choice) {
            case "Crackling Shield":
                minion.addKeyword("Divine Shield");

                break;
            case "Flaming Claws":
                minion.addStats(3, 0);

                break;
            case "Living Spores":
                minion.addDeathrattle((plr, game) => {
                    game.summonMinion(new game.Card("Plant"), plr);
                    game.summonMinion(new game.Card("Plant"), plr);
                });

                break;
            case "Lightning Speed":
                minion.addKeyword("Windfury");

                break;
            case "Liquid Membrane":
                minion.addKeyword("Elusive");

                break;
            case "Massive":
                minion.addKeyword("Taunt");

                break;
            case "Volcanic Might":
                minion.addStats(1, 1);

                break;
            case "Rocky Carapace":
                minion.addStats(0, 3);

                break;
            case "Shrouding Mist":
                minion.addKeyword("Stealth");
                minion.setStealthDuration(1);

                break;
            case "Poison Spit":
                minion.addKeyword("Poisonous");

                break;
            default:
                break;
        }

        return choice;
    }
}
