module.exports = {
    name: "Spiritsinger Umbra",
    stats: [3, 4],
    desc: "After you summon a minion, trigger its Deathrattle effect.",
    mana: 4,
    type: "Minion",
    tribe: "None",
    class: "Neutral",
    rarity: "Legendary",
    set: "Journey to Un'Goro",
    id: 50,

    passive(plr, game, card, key, val) {
        if (!["SummonMinion", "PlayCard"].includes(key) || val.type != "Minion" || game.player != plr) return; // If key is not "SummonMinion" or "PlayCard", return
        
        val.activate("deathrattle");
    }
}
