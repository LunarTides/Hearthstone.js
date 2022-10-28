module.exports = {
    name: "Nazmani Bloodweaver",
    stats: [2, 5],
    desc: "After you cast a spell, reduce the cost of a random card in your hand by (1).",
    mana: 3,
    tribe: "None",
    class: "Priest",
    rarity: "Rare",
    set: "Madness at the Darkmoon Faire",

    passive(plr, game, card, trigger) {
        if (!card.passiveCheck(trigger, "spellsCast", null, plr)) return;
        if (plr.hand.filter(c => c.mana > 0).length <= 0) return;
        
        let randomCard;

        do randomCard = game.functions.randList(plr.hand);
        while (randomCard.mana <= 0);

        randomCard.mana -= 1;
    }
}