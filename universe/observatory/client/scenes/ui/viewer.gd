extends Control
class_name Viewer


# Called when the node enters the scene tree for the first time.
func _ready() -> void:
	_update_ui()


# Called every frame. 'delta' is the elapsed time since the previous frame.
func _process(delta: float) -> void:
	pass


func _unhandled_input(event: InputEvent) -> void:
	if event is InputEventMouseButton and event.button_index == MOUSE_BUTTON_LEFT and event.is_released():
		if not get_global_rect().has_point(get_global_mouse_position()):
			queue_free()


func _update_ui() -> void:
	pass
