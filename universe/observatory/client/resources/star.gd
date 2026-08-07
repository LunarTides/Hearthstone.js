extends Resource
class_name StarRes

@export var name: String:
	set(value):
		if name != value:
			name = value
			changed.emit()


static func create_from_json(star) -> StarRes:
	var new_star: StarRes = new()
	new_star.name = star.name
	return new_star
