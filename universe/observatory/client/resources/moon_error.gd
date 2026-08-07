extends Resource
class_name MoonErrorRes

@export var message: String:
	set(value):
		if message != value:
			message = value
			changed.emit()
@export var labels: Array:
	set(value):
		if labels != value:
			labels = value
			changed.emit()


static func create_from_json(error) -> MoonErrorRes:
	var new_error: MoonErrorRes = new()
	new_error.message = error.message
	new_error.labels = error.labels
	return new_error
