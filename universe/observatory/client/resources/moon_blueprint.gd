extends Resource
class_name MoonBlueprintRes

@export var name: String:
	set(value):
		if name != value:
			name = value
			changed.emit()
@export var text: String:
	set(value):
		if text != value:
			text = value
			changed.emit()
@export var cost: int:
	set(value):
		if cost != value:
			cost = value
			changed.emit()
@export var type: String:
	set(value):
		if type != value:
			type = value
			changed.emit()
@export var classes: PackedStringArray:
	set(value):
		if classes != value:
			classes = value
			changed.emit()
@export var rarity: String:
	set(value):
		if rarity != value:
			rarity = value
			changed.emit()
@export var tags: PackedStringArray:
	set(value):
		if tags != value:
			tags = value
			changed.emit()
@export var collectible: bool:
	set(value):
		if collectible != value:
			collectible = value
			changed.emit()
@export var id: String:
	set(value):
		if id != value:
			id = value
			changed.emit()

@export var attack: int:
	set(value):
		if attack != value:
			attack = value
			changed.emit()
@export var health: int:
	set(value):
		if attack != value:
			attack = value
			changed.emit()
@export var tribes: PackedStringArray:
	set(value):
		if tribes != value:
			tribes = value
			changed.emit()

@export var spell_schools: PackedStringArray:
	set(value):
		if spell_schools != value:
			spell_schools = value
			changed.emit()

@export var durability: int:
	set(value):
		if durability != value:
			durability = value
			changed.emit()
@export var cooldown: int:
	set(value):
		if cooldown != value:
			cooldown = value
			changed.emit()

@export var armor: int:
	set(value):
		if armor != value:
			armor = value
			changed.emit()
@export var hero_power_id: int:
	set(value):
		if hero_power_id != value:
			hero_power_id = value
			changed.emit()

@export var enchantment_priority: int:
	set(value):
		if enchantment_priority != value:
			enchantment_priority = value
			changed.emit()


static func create_from_json(blueprint) -> MoonBlueprintRes:
	var new_blueprint: MoonBlueprintRes = new()
	new_blueprint.name = blueprint.name
	new_blueprint.text = blueprint.text
	new_blueprint.cost = blueprint.cost
	new_blueprint.type = blueprint.type
	new_blueprint.classes = blueprint.classes
	new_blueprint.rarity = blueprint.rarity
	new_blueprint.tags = blueprint.tags
	new_blueprint.collectible = blueprint.collectible
	new_blueprint.id = blueprint.id
	
	if blueprint.has("attack"):
		new_blueprint.attack = blueprint.attack
		new_blueprint.health = blueprint.health
	
	if blueprint.has("tribes"):
		new_blueprint.tribes = blueprint.tribes
	
	if blueprint.has("spellSchools"):
		new_blueprint.spell_schools = blueprint.spellSchools
	
	if blueprint.has("durability"):
		new_blueprint.durability = blueprint.durability
		new_blueprint.cooldown = blueprint.cooldown
	
	if blueprint.has("armor"):
		new_blueprint.armor = blueprint.armor
		new_blueprint.hero_power_id = blueprint.heropowerId
	
	if blueprint.has("enchantmentPriority"):
		new_blueprint.enchantment_priority = blueprint.enchantmentPriority
	return new_blueprint
