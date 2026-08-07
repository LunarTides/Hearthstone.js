extends Resource
class_name MoonCommandRes

@export var name: String:
	set(value):
		if name != value:
			name = value
			changed.emit()
@export var description: String:
	set(value):
		if description != value:
			description = value
			changed.emit()
@export var debug: bool:
	set(value):
		if debug != value:
			debug = value
			changed.emit()
@export var id: String:
	set(value):
		if id != value:
			id = value
			changed.emit()


static func create_from_json(command) -> MoonCommandRes:
	var new_command: MoonCommandRes = new()
	new_command.name = command.name
	new_command.description = command.description
	new_command.debug = command.debug
	new_command.id = command.id
	return new_command
