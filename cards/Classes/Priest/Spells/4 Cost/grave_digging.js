module.exports = {
    name: "Grave Digging",
    desc: "Draw 2 cards.",
    mana: 2,
    class: "Priest",
    rarity: "Epic",
    set: "March of the Lich King",
    spellClass: "Shadow",
    id: 245,

    cast(plr, game, self) {
        // Screw this card :)
        for (let i = 0; i < 2; i++) plr.drawCard();
    }
}