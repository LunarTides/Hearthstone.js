extends Resource
class_name MoonSFXRes

@export var name: String:
	set(value):
		if name != value:
			name = value
			changed.emit()
@export var id: String:
	set(value):
		if id != value:
			id = value
			changed.emit()


static func create_from_json(sfx) -> MoonSFXRes:
	var new_sfx: MoonSFXRes = new()
	new_sfx.name = sfx.name
	new_sfx.id = sfx.id
	return new_sfx
