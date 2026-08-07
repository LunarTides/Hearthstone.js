extends Resource
class_name MoonDependencyComponentsRes

@export var ids: String:
	set(value):
		if ids != value:
			ids = value
			changed.emit()
@export var author_name: String:
	set(value):
		if author_name != value:
			author_name = value
			changed.emit()
@export var pack_name: String:
	set(value):
		if pack_name != value:
			pack_name = value
			changed.emit()
@export_enum("card", "command", "sfx") var resource_type: String:
	set(value):
		if resource_type != value:
			resource_type = value
			changed.emit()
@export var moon_resource_name: String:
	set(value):
		if moon_resource_name != value:
			moon_resource_name = value
			changed.emit()
@export var index: int:
	set(value):
		if index != value:
			index = value
			changed.emit()
@export var raw: String:
	set(value):
		if raw != value:
			raw = value
			changed.emit()


static func create_from_json(components) -> MoonDependencyComponentsRes:
	var new_components: MoonDependencyComponentsRes = new()
	new_components.ids = components.ids
	new_components.author_name = components.authorName
	new_components.pack_name = components.packName
	new_components.resource_type = components.resourceType
	new_components.moon_resource_name = components.resourceName
	new_components.index = components.index
	new_components.raw = components.raw
	return new_components
