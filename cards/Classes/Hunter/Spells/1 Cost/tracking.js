module.exports = {
    name: "Tracking",
    desc: "Discover a card from your deck.",
    mana: 1,
    type: "Spell",
    class: "Hunter",
    rarity: "Free",
    set: "Legacy",
    id: 215,

    cast(plr, game, self) {
        let list = plr.deck;

        let card = game.interact.discover("Discover a card from your deck.", list, 3, false, false);

        plr.drawSpecific(card);
    }
}
