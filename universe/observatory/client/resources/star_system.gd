extends Resource
class_name StarSystemRes

@export var star: StarRes:
	set(value):
		if star != value:
			star = value
			changed.emit()
@export var planets: Array[PlanetRes]:
	set(value):
		if planets != value:
			planets = value
			changed.emit()


static func create_from_json(star_system) -> StarSystemRes:
	var new_planets: Array[PlanetRes] = []
	for planet in star_system.planets:
		new_planets.append(PlanetRes.create_from_json(planet))
	
	var new_star_system: StarSystemRes = new()
	new_star_system.star = StarRes.create_from_json(star_system.star)
	new_star_system.planets = new_planets
	return new_star_system
