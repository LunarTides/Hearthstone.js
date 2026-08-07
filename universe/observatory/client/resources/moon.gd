extends Resource
class_name MoonRes

@export var name: String:
	set(value):
		if name != value:
			name = value
			changed.emit()
@export_enum("card", "command", "sfx") var type: String:
	set(value):
		if type != value:
			type = value
			changed.emit()
@export var bytes: int:
	set(value):
		if bytes != value:
			bytes = value
			changed.emit()
@export var blueprint: MoonBlueprintRes
@export var command: MoonCommandRes
@export var sfx: MoonSFXRes
@export var violations: Dictionary:
	set(value):
		if violations != value:
			violations = value
			changed.emit()
@export var imports: Dictionary:
	set(value):
		if imports != value:
			imports = value
			changed.emit()
@export var dependencies: Array[MoonDependencyRes]:
	set(value):
		if dependencies != value:
			dependencies = value
			changed.emit()
@export var errors: Array[MoonErrorRes]:
	set(value):
		if errors != value:
			errors = value
			changed.emit()
@export var predictions: Dictionary:
	set(value):
		if predictions != value:
			predictions = value
			changed.emit()


static func create_from_json(moon) -> MoonRes:
	var new_dependencies: Array[MoonDependencyRes] = []
	for dependency in moon.dependencies:
		new_dependencies.append(MoonDependencyRes.create_from_json(dependency))
	
	var new_errors: Array[MoonErrorRes] = []
	for error in moon.errors:
		new_errors.append(MoonErrorRes.create_from_json(error))
	
	var new_moon: MoonRes = new()
	new_moon.name = moon.name
	new_moon.type = moon.type
	new_moon.bytes = moon.bytes
	
	if moon.has("blueprint"):
		new_moon.blueprint = MoonBlueprintRes.create_from_json(moon.blueprint)
	if moon.has("command"):
		new_moon.command = MoonCommandRes.create_from_json(moon.command)
	if moon.has("sfx"):
		new_moon.sfx = MoonSFXRes.create_from_json(moon.sfx)
	new_moon.violations = moon.violations
	new_moon.imports = moon.imports
	new_moon.dependencies = new_dependencies
	new_moon.errors = new_errors
	new_moon.predictions = moon.predictions
	return new_moon
