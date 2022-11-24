from os import system as cmd

editor = 'vim'

_type = input("Type: ")
mw = _type.lower() in ["minion", "weapon"];

_stats = ""
_tribe = ""
_spellClass = ""

name = input("Name: ")
_displayName = input("Display Name: ")
if not _displayName: _displayName = name;
if mw: _stats = input("Stats: ").split("/")
else: _spellClass = input("Spell Class: ")
desc = input("Desc: ")
mana = input("Mana: ")
if mw: _tribe = input("Tribe: ")
_class = input("Class: ")
if not _class: _class = "Neutral"
rarity = input("Rarity: ")
_set = input("Set: ")
_keywords = input("Keywords: ").split(",")
function = input("Functions: ").lower()

displayName = f'displayName: "{_displayName}",\n    ' if _displayName != name else ''
stats = f'stats: [{", ".join(_stats)}],\n    ' if mw and _stats else ''
keywords_1 = '", "'.join(_keywords)
keywords = f'keywords: ["{keywords_1}"],\n    ' if mw and _keywords else ''
tribe = f'tribe: "{_tribe}",\n    ' if mw and _tribe else ''
spellClass = f'spellClass: "{_spellClass}",\n    ' if not mw and _spellClass else ''

if _class == "Neutral": path = f"cards/Neutral/{_type}s/{mana} Cost/"
else: path = f"cards/Classes/{_class}/{_type}s/{mana} Cost/"
filename = f"{name.replace(' ', '_').lower()}.js"

with open(path + filename, "w+") as f:
    f.write('''module.exports = {
    name: "''' + name + '''",
    ''' + displayName + stats + '''desc: "''' + desc + '''",
    mana: ''' + mana + ''',
    ''' + tribe + '''class: "''' + _class + '''",
    rarity: "''' + rarity + '''",
    set: "''' + _set + '''",
    ''' + spellClass + keywords + '''
    ''' + function + '''(plr, game, card) {
        
    }
}''');

    print(path);

cmd(f'{editor} "{path}{filename}"')
