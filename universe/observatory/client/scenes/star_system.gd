@tool
extends Node2D
class_name StarSystem

const STAR = preload("uid://b1h588am46qma")
const PLANET = preload("uid://6uoa2o4iso6l")

@export var star_system: StarSystemRes:
	set(value):
		star_system = value
		queue_redraw()
		
		if is_instance_valid(star_system):
			name = star_system.star.name

# Called when the node enters the scene tree for the first time.
func _ready() -> void:
	if not Engine.is_editor_hint():
		setup_star_and_planets()


# Called every frame. 'delta' is the elapsed time since the previous frame.
func _process(delta: float) -> void:
	pass


func setup_star_and_planets():
	var star_scene: Star = STAR.instantiate()
	star_scene.star = star_system.star
	
	for planet: PlanetRes in star_system.planets:
		var planet_scene: Planet = PLANET.instantiate()
		planet_scene.planet = planet
		planet_scene.place_at_random_position_relative_to(star_scene, true)
		planet_scene.connection_color = Color(randf(), randf(), randf())
		star_scene.connected.append(planet_scene)
		add_child(planet_scene)
	
	add_child(star_scene)
