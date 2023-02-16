const rl = require("readline-sync");
const fs = require("fs");

let card = {};

function common(m = 0) {
    const name = rl.question("Name: ");
    const displayName = rl.question("Display Name: ");
    if (m > 0) var stats = rl.question("Stats: ");
    const description = rl.question("Description: ");
    const cost = rl.question("Mana Cost: ");
    if (m > 1) var tribe = rl.question("Tribe: ");
    const _class = rl.question("Class: ");
    const rarity = rl.question("Rarity: ");
    const set = rl.question("Set: ");
    if (_class == "Death Knight") var runes = rl.question("Runes: ");
    const keywords = rl.question("Keywords: ");

    card.name = name;
    if (displayName) card.displayName = displayName;
    if (m && stats) card.stats = "[" + stats.split("/").map(k => parseInt(k)).join(", ") + "]";
    card.desc = description;
    card.mana = parseInt(cost);
    if (m > 1) card.tribe = tribe || "None";
    card.class = _class;
    card.rarity = rarity;
    card.set = set;
    if (runes) card.runes = runes;
    if (keywords) card.keywords = '["' + keywords.split(', ').join('", "') + '"]';
}

function spell() {
    common()

    const spellClass = rl.question("Spell Class: ");

    if (spellClass) card.spellClass = spellClass;
}

function location() {
    minionOrWeapon(1)

    const cooldown = rl.question("Cooldown: ");

    if (cooldown) card.cooldown = cooldown;
}

const type = rl.question("Type: ");

if (["minion", "weapon"].includes(type.toLowerCase())) common(type.toLowerCase() == "weapon" ? 1 : 2);
else if (type.toLowerCase() == "spell") spell();
else if (type.toLowerCase() == "location") location();
else if (type.toLowerCase() == "hero") common();

const uncollectible = rl.keyInYN("Uncollectible?");
if (uncollectible) card.uncollectible = uncollectible;

let func;
let _type = type.toLowerCase();

if (_type == "spell") func = "Cast";
else if (_type == "hero") func = "HeroPower";
else if (_type == "location") func = "Use";
else {
    //func = rl.question("Function: ");
    let reg = /^[A-Z].*?: /;
    func = card.desc.match(reg);
    if (!func && card.desc) func = "Passive: ";
    else if (!card.desc) func = "";
    else func = func[0];

    func = func.slice(0, -2);
}

let triggerText = ")";
if (func.toLowerCase() == "passive") triggerText = ", key, val)";
if (func) func = `\n\n    ${func.toLowerCase()}(plr, game, self${triggerText} {\n\n    }`;

_type = (type == "Hero") ? "Heroe" : type;

let _class = card.class;
if (card.class.split(" / ").length > 1) {
    let __class = card.class.split(" / ");

    __class.forEach(c => {
        _class += `${c}/`;
    });

    _class.slice(0, -1);
}
let path = `../cards/Classes/${_class}/${_type}s/${card.mana} Cost/`;
let filename = card.name.toLowerCase().replaceAll(" ", "_") + ".js";

let id = parseInt(fs.readFileSync("../.latest_id", "utf8"));
_id = card.uncollectible ? "" : `\n    id: ${id},`; // Don't add an id if the card is uncollectible. Id's are only used when creating/importing a deck.

let content = Object.entries(card).map(c => `${c[0]}: ${(typeof(c[1]) == "string" && c[1][0] != "[") ? '"' + c[1] + '"' : c[1]}`);
content = `module.exports = {
    ${content.join(',\n    ')},${_id}${func}
}`;

if (!card.uncollectible) fs.writeFileSync("../.latest_id", (id + 1).toString());

if (!fs.existsSync(path)) fs.mkdirSync(path, { recursive: true });
fs.writeFileSync(path + filename, content);

let _path = path.replaceAll("/", "\\") + filename;
console.log('File created at: "' + _path + '"');

require("child_process").exec(`start vim "${_path}"`);
