extends CharacterBody2D
class_name AstronomicalBody

signal hover_begun
signal hover_ended
signal clicked(mouse_button: MouseButton)

@export var connected: Array[AstronomicalBody]:
	set(value):
		connected = value
		queue_redraw()
@export var connection_priority: int = 0
@export var connection_color: Color = Color.WEB_GRAY
@export var is_pushed_away_by_others: bool = true
@export var push_box_radius := 32
@export var push_box_visible_in_editor := true:
	set(value):
		push_box_visible_in_editor = value
		
		if is_instance_valid(push_box):
			push_box.visible = push_box_visible_in_editor

var hovering := false:
	set(value):
		if hovering != value:
			hovering = value
			queue_redraw()
			
			if hovering:
				hover_begun.emit()
			else:
				hover_ended.emit()
var emerging_by := -1
var frame_counter := 0
var lines: Array[Line2D]
var push_box: Area2D
var name_label: Label

# Called when the node enters the scene tree for the first time.
func _ready() -> void:
	input_pickable = true
	
	mouse_entered.connect(_on_mouse_entered)
	mouse_exited.connect(_on_mouse_exited)
	input_event.connect(_on_input_event)
	renamed.connect(queue_redraw)
	
	create_name_label()
	create_push_box()
	create_connected_lines()
	play_connect_emerge_from_animation()


# Called every frame. 'delta' is the elapsed time since the previous frame.
func _process(delta: float) -> void:
	for i: int in range(connected.size()):
		var body := connected[i]
		if lines.size() <= i:
			break
		
		var line: Line2D = lines[i]
		line.set_point_position(1, to_local(body.global_position))


func _physics_process(delta: float) -> void:
	velocity = Vector2.ZERO
	
	if is_pushed_away_by_others:
		for area: Area2D in push_box.get_overlapping_areas():
			velocity = (global_position - area.global_position).normalized() * 100
	
	move_and_slide()
	
	frame_counter += 1
	if frame_counter % 10 != 0:
		return
	
	position += Vector2(sin(frame_counter * 0.05) * randf(), cos(frame_counter * 0.05) * randf())


func _draw() -> void:
	pass


func _get_color() -> Color:
	return Color.WHITE


func _on_mouse_entered() -> void:
	hovering = true


func _on_mouse_exited() -> void:
	hovering = false


func _on_input_event(viewport: Node, event: InputEvent, shape_idx: int) -> void:
	if event is InputEventMouseButton and event.is_released():
		clicked.emit(event.button_index)


func play_connect_emerge_from_animation() -> void:
	for body: AstronomicalBody in connected:
		if body.emerging_by >= connection_priority:
			continue
		
		body.emerging_by = connection_priority
		
		# Wait for any other potential claimants.
		await get_tree().process_frame
		
		# A higher priority connection has claimed this body.
		if body.emerging_by > connection_priority:
			continue
		
		var old_position := body.global_position
		body.global_position = global_position
		
		var tween := create_tween().set_ease(Tween.EASE_OUT).set_trans(Tween.TRANS_BACK)
		tween.tween_property(body, ^"global_position", old_position, 0.5)
		tween.tween_property(body, ^"emerging_by", -1, 0)


func create_connected_lines():
	for line: Line2D in lines:
		line.queue_free()
	lines.clear()
	
	for body: AstronomicalBody in connected:
		# Randomize slightly to create diversity. This diversity will carry over to any children.
		connection_color = connection_color.lerp(Color(randf(), randf(), randf()), 0.025)
		
		var line := Line2D.new()
		line.width = 3
		line.antialiased = true
		line.default_color = connection_color
		line.z_index = -1
		
		add_child(line)
		line.add_point(Vector2.ZERO)
		line.add_point(line.to_local(body.global_position))
		lines.append(line)


func create_push_box():
	if is_instance_valid(push_box):
		push_box.queue_free()
	
	var shape := CircleShape2D.new()
	shape.radius = push_box_radius
	
	var collision_shape := CollisionShape2D.new()
	collision_shape.shape = shape
	
	push_box = Area2D.new()
	add_child(push_box)
	push_box.add_child(collision_shape)


func create_name_label():
	if is_instance_valid(name_label):
		name_label.queue_free()
	
	name_label = Label.new()
	name_label.text = name
	name_label.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	name_label.add_theme_font_size_override("font_size", 12)
	add_child(name_label)
	# TODO: Fix positioning based on text length.
	name_label.position = Vector2(-55, -32)


func place_at_random_position_relative_to(body: AstronomicalBody, use_local_space: bool = false):
	# TODO: Make this less random and stupid.
	var direction := Vector2(randf_range(-1, 1), randf_range(-1, 1)).normalized()
	
	if use_local_space:
		# Distance between planets.
		position += direction * randf_range(400, 600)
	else:
		# Distance between moons.
		global_position = body.position + direction * randf_range(50, 400)
