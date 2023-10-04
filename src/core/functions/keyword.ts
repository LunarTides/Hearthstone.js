import { Card, Player } from "../../internal.js";

const galakrond = {
    /**
     * Returns the result of the galakrond formula
     * 
     * @param invokeCount How many times that the card has been invoked.
     */
    formula(invokeCount: number) {
        const x = invokeCount;
        const y = Math.ceil((x + 1) / 2) + Math.round(x * 0.15);

        return y || 1;
    },

    /**
     * Bumps the invoke count for a card.
     * 
     * @param card The card. Just put in `self`.
     * @param storageName The name where the info is stored. I recommend "invokeCount". You can get that information from `card.storage[storageName]` afterwards.
     */
    bump(card: Card, storageName: string) {
        if (!card.storage[storageName]) card.storage[storageName] = 0;
        if (card.storage[storageName] >= 3) card.storage[storageName] = 3;

        card.storage[storageName]++;
    },
}

export const keywordFunctions = {
    /**
     * Galakrond related functions
     */
    galakrond,

    /**
     * Asks the user a `prompt` and show 3 choices for the player to choose, and do something to the minion based on the choice.
     * 
     * @param minion The minion to adapt
     * @param prompt The prompt to ask the user
     * @param _values DON'T TOUCH THIS UNLESS YOU KNOW WHAT YOU'RE DOING
     * 
     * @returns An array with the name of the adapt(s) chosen, or -1 if the user cancelled.
     */
    adapt(minion: Card, prompt: string = "Choose One:", _values: string[][] = []): string | -1 {
        if (!minion) return -1;

        game.interact.info.printAll(game.player);

        const possibleCards = [
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
        const values = _values;

        if (values.length == 0) {
            for (let i = 0; i < 3; i++) {
                const c = game.lodash.sample(possibleCards);
                if (!c) throw new Error("null when randomly choosing adapt option");

                if (c instanceof Card) throw new TypeError();

                values.push(c);
                game.functions.util.remove(possibleCards, c);
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
            game.input("<red>Invalid choice!</red>\n");
            return this.adapt(minion, prompt, values);
        }

        if (parseInt(choice) > 3) return this.adapt(minion, prompt, values);

        choice = values[parseInt(choice) - 1][0];

        switch (choice) {
            case "Crackling Shield":
                minion.addKeyword("Divine Shield");

                break;
            case "Flaming Claws":
                minion.addStats(3, 0);

                break;
            case "Living Spores":
                minion.addAbility("deathrattle", (plr, self) => {
                    game.summonMinion(new Card("Plant", plr), plr);
                    game.summonMinion(new Card("Plant", plr), plr);
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
    },

    /**
     * Invoke the `plr`'s Galakrond
     * 
     * @param plr The player
     * 
     * @returns Success
     */
    invoke(plr: Player): boolean {
        // Find the card in player's deck/hand/hero that begins with "Galakrond, the "
        const deckGalakrond = plr.deck.find(c => c.displayName.startsWith("Galakrond, the "));
        const handGalakrond = plr.hand.find(c => c.displayName.startsWith("Galakrond, the "));
        if ((!deckGalakrond && !handGalakrond) && !plr.hero?.displayName.startsWith("Galakrond, the ")) return false;

        plr.deck.filter(c => {
            c.activate("invoke");
        });
        plr.hand.filter(c => {
            c.activate("invoke");
        });
        game.board[plr.id].forEach(c => {
            c.activate("invoke");
        });

        if (plr.hero?.displayName.startsWith("Galakrond, the ")) plr.hero.activate("heropower");
        else if (deckGalakrond) deckGalakrond.activate("heropower");
        else if (handGalakrond) handGalakrond.activate("heropower");

        return true;
    },

    /**
     * Chooses a minion from `list` and puts it onto the board.
     * 
     * @param plr The player
     * @param list The list to recruit from. This defaults to `plr`'s deck.
     * @param amount The amount of minions to recruit
     * 
     * @returns Returns the cards recruited
     */
    recruit(plr: Player, list?: Card[], amount: number = 1): Card[] {
        if (!list) list = plr.deck;
        const _list = list;

        list = game.lodash.shuffle(list.slice());

        let times = 0;
        const cards: Card[] = [];

        list = list.filter(c => c.type == "Minion");
        list.forEach(c => {
            if (times >= amount) return;

            game.summonMinion(c.imperfectCopy(), plr);

            times++;
            cards.push(c);
        });

        cards.forEach(c => {
            game.functions.util.remove(_list, c);
        });

        return cards;
    },
}
