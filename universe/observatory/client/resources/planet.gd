extends Resource
class_name PlanetRes

@export var name: String:
	set(value):
		if name != value:
			name = value
			changed.emit()
@export var moons: Array[MoonRes]:
	set(value):
		if moons != value:
			moons = value
			changed.emit()


static func create_from_json(planet) -> PlanetRes:
	var new_moons: Array[MoonRes] = []
	for moon in planet.moons:
		new_moons.append(MoonRes.create_from_json(moon))
	
	var new_planet: PlanetRes = new()
	new_planet.name = planet.name
	new_planet.moons = new_moons
	return new_planet
