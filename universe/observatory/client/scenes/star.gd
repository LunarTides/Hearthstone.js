@tool
extends AstronomicalBody
class_name Star

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
	
	draw_circle(Vector2.ZERO, 8, color, true, -1, true)


func _get_color() -> Color:
	# TODO: Color based on properties.
	return Color.ORANGE


func _on_click(mouse_button: MouseButton):
	if mouse_button == MOUSE_BUTTON_LEFT:
		# TODO: Show panel.
		print("clicka on star %s" % name)
		Socket.send("query star %s" % name)
