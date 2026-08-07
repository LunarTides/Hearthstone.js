extends Node2D

const STAR_SYSTEM = preload("uid://btpy1p26l4j67")

@export var pan_speed: float = 300
@export var zoom_speed: float = 10

@export_category("Nodes")
@export var camera_2d: Camera2D
@export var bg_1: ColorRect
@export var bg_2: ColorRect
@export var fps_label: Label

var listen_for_keys: bool = true
var actual_pan_speed: float = 0
var old_camera_2d_position: Vector2
var last_mouse_position: Vector2


# Called when the node enters the scene tree for the first time.
func _ready() -> void:
	actual_pan_speed = pan_speed
	camera_2d.global_position = DisplayServer.window_get_size() / 2
	
	for child: Node in get_children():
		if child is StarSystem:
			child.queue_free()
	
	# TODO: Add galaxies and star clusters.
	for star_system: StarSystemRes in Universe.get_all_star_systems():
		var scene: StarSystem = STAR_SYSTEM.instantiate()
		scene.star_system = star_system
		scene.global_position = DisplayServer.window_get_size() / 2
		add_child(scene)


# Called every frame. 'delta' is the elapsed time since the previous frame.
func _process(delta: float) -> void:
	fps_label.text = "FPS: %d" % Engine.get_frames_per_second()
	
	var mouse_pos: Vector2 = get_global_mouse_position()
	
	if camera_2d.enabled:
		# Camera panning
		var true_pan_speed: float = actual_pan_speed
		if Input.is_action_pressed(&"pan_speed_up"):
			true_pan_speed *= 5
		
		if listen_for_keys:
			var vector: Vector2 = Input.get_vector(&"pan_left", &"pan_right", &"pan_up", &"pan_down")
			var is_ctrl_pressed: bool = Input.is_key_pressed(KEY_CTRL)
			
			# Pan using arrow keys.
			if vector and not is_ctrl_pressed:
				camera_2d.position += vector * true_pan_speed * delta
		
		# Pan using right mouse button.
		var should_set_last_mouse_position: bool = true
		
		var is_rmb_pressed: bool = Input.is_mouse_button_pressed(MOUSE_BUTTON_RIGHT)
		if is_rmb_pressed and last_mouse_position:
			var mouse_vector: Vector2 = last_mouse_position - mouse_pos
			if not mouse_vector.is_zero_approx():
				camera_2d.position += mouse_vector
				should_set_last_mouse_position = false
		
		if should_set_last_mouse_position:
			last_mouse_position = mouse_pos
			
		old_camera_2d_position = camera_2d.position
	
	# Scale pan speed based on camera zoom.
	actual_pan_speed = pan_speed * (1 / camera_2d.zoom.x)


func _unhandled_input(event: InputEvent) -> void:
	if camera_2d.enabled and listen_for_keys:
		# Zooming
		if Input.is_action_pressed(&"zoom_reset"):
			camera_2d.zoom = Vector2.ONE
		elif Input.is_action_pressed(&"zoom_in"):
			camera_2d.zoom += Vector2.ONE * zoom_speed * 0.1 * 0.1
			if camera_2d.zoom > Vector2(2.0, 2.0):
				camera_2d.zoom = Vector2(2.0, 2.0)
		elif Input.is_action_pressed(&"zoom_out"):
			camera_2d.zoom -= Vector2.ONE * zoom_speed * 0.1 * 0.1
			if camera_2d.zoom < Vector2(0.1, 0.1):
				camera_2d.zoom = Vector2(0.1, 0.1)
