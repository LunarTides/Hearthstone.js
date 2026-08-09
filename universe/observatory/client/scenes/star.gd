@tool
extends AstronomicalBody
class_name Star

const STAR_VIEWER = preload("uid://oltbsj8m0syp")

@export var star: StarRes:
	set(value):
		star = value
		queue_redraw()
		
		if is_instance_valid(star):
			name = star.name

# Called when the node enters the scene tree for the first time.
func _ready() -> void:
	super()
	
	push_box_radius = 128
	clicked.connect(_on_click)


# Called every frame. 'delta' is the elapsed time since the previous frame.
func _process(delta: float) -> void:
	super(delta)


func _draw() -> void:
	super()
	
	var color := _get_color()
	if hovering:
		color = color.darkened(0.2)
	
	draw_circle(Vector2.ZERO, 32, color, true, -1, true)


func _get_color() -> Color:
	# TODO: Color based on properties.
	return Color.ORANGE


func _on_click(mouse_button: MouseButton):
	if mouse_button == MOUSE_BUTTON_LEFT:
		print("clicka on star %s" % name)
		Socket.send("query star %s" % name)


func _open_viewer() -> void:
	if Engine.is_editor_hint():
		return
	
	super()
	viewer = STAR_VIEWER.instantiate()
	viewer.star = star
	add_child(viewer)
	viewer.global_position = get_global_mouse_position()
