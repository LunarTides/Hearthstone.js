extends Node

var universe: UniverseRes

# Called when the node enters the scene tree for the first time.
func _ready() -> void:
	read_universe_file()
	
	#ResourceSaver.save(universe, "res://resources/test_universe.tscn")


# Called every frame. 'delta' is the elapsed time since the previous frame.
func _process(delta: float) -> void:
	pass


func read_universe_file():
	var file_content := FileAccess.get_file_as_string("res://universe.json")
	var json = JSON.parse_string(file_content)
	universe = UniverseRes.create_from_json(json)


func get_all_star_clusters() -> Array[StarClusterRes]:
	var star_clusters: Array[StarClusterRes]
	for galaxy: GalaxyRes in universe.galaxies:
		star_clusters.append_array(galaxy.star_clusters)
	return star_clusters


func get_all_star_systems() -> Array[StarSystemRes]:
	var star_systems: Array[StarSystemRes]
	for galaxy: GalaxyRes in universe.galaxies:
		for star_cluster: StarClusterRes in galaxy.star_clusters:
			star_systems.append_array(star_cluster.star_systems)
	return star_systems


func get_all_stars() -> Array[StarRes]:
	var stars: Array[StarRes]
	for galaxy: GalaxyRes in universe.galaxies:
		for star_cluster: StarClusterRes in galaxy.star_clusters:
			for star_system: StarSystemRes in star_cluster.star_systems:
				stars.append(star_system.star)
	return stars


func get_all_planets() -> Array[PlanetRes]:
	var planets: Array[PlanetRes]
	for galaxy: GalaxyRes in universe.galaxies:
		for star_cluster: StarClusterRes in galaxy.star_clusters:
			for star_system: StarSystemRes in star_cluster.star_systems:
				planets.append_array(star_system.planets)
	return planets


func get_all_moons() -> Array[MoonRes]:
	var moons: Array[MoonRes]
	for galaxy: GalaxyRes in universe.galaxies:
		for star_cluster: StarClusterRes in galaxy.star_clusters:
			for star_system: StarSystemRes in star_cluster.star_systems:
				for planet: PlanetRes in star_system.planets:
					moons.append_array(planet.moons)
	return moons
