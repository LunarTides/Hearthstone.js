@tool
extends AstronomicalBody
class_name Moon

const MOON_VIEWER = preload("uid://n30ggui1hxc2")

@export var moon: MoonRes:
	set(value):
		moon = value
		queue_redraw()
		
		if is_instance_valid(moon):
			name = moon.name

# Called when the node enters the scene tree for the first time.
func _ready() -> void:
	super()
	
	clicked.connect(_on_click)


# Called every frame. 'delta' is the elapsed time since the previous frame.
func _process(delta: float) -> void:
	super(delta)


func _draw() -> void:
	super()
	
	var color := _get_color()
	if hovering:
		color = color.darkened(0.2)
	
	draw_circle(Vector2.ZERO, 8, color, true, -1, true)


func _get_color() -> Color:
	# TODO: Color based on properties.
	return Color.WHITE


func _open_viewer() -> void:
	if Engine.is_editor_hint():
		return
	
	super()
	viewer = MOON_VIEWER.instantiate()
	viewer.moon = moon
	add_child(viewer)
	viewer.global_position = get_global_mouse_position()


func _on_click(mouse_button: MouseButton):
	if mouse_button == MOUSE_BUTTON_LEFT:
		# TODO: Show panel.
		print("clicka on moon %s" % name)
		Socket.send("query moon %s" % name)
