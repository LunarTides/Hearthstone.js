extends Resource
class_name MoonDependencyRes

@export var components: MoonDependencyComponentsRes:
	set(value):
		if components != value:
			components = value
			changed.emit()
@export var id: String:
	set(value):
		if id != value:
			id = value
			changed.emit()


static func create_from_json(dependency) -> MoonDependencyRes:
	var new_dependency: MoonDependencyRes = new()
	new_dependency.components = MoonDependencyComponentsRes.create_from_json(dependency.components)
	new_dependency.id = dependency.id
	return new_dependency
