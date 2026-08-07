extends Resource
class_name UniverseRes

@export var galaxies: Array[GalaxyRes]:
	set(value):
		if galaxies != value:
			galaxies = value
			changed.emit()


static func create_from_json(universe) -> UniverseRes:
	var new_galaxies: Array[GalaxyRes] = []
	for galaxy in universe.galaxies:
		new_galaxies.append(GalaxyRes.create_from_json(galaxy))
	
	var new_universe: UniverseRes = new()
	new_universe.galaxies = new_galaxies
	return new_universe
