@tool
extends AstronomicalBody
class_name Planet

const MOON = preload("uid://i3dmukspifco")

@export var planet: PlanetRes:
	set(value):
		planet = value
		queue_redraw()
		
		if is_instance_valid(planet):
			name = planet.name

# Called when the node enters the scene tree for the first time.
func _ready() -> void:
	super()
	push_box_radius = 64
	
	if not Engine.is_editor_hint():
		setup_moons()
	
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
	return Color.NAVY_BLUE


func _on_click(mouse_button: MouseButton):
	if mouse_button == MOUSE_BUTTON_LEFT:
		# TODO: Show panel.
		print("clicka on planet %s" % name)
		Socket.send("query planet %s" % name)


func setup_moons() -> void:
	for moon: MoonRes in planet.moons:
		var moon_scene: Moon = MOON.instantiate()
		moon_scene.moon = moon
		moon_scene.place_at_random_position_relative_to(self)
		connected.append(moon_scene)
		add_sibling.call_deferred(moon_scene)
	
	create_connected_lines()
