extends Resource
class_name StarClusterRes

@export var star_systems: Array[StarSystemRes]:
	set(value):
		if star_systems != value:
			star_systems = value
			changed.emit()


static func create_from_json(star_cluster) -> StarClusterRes:
	var new_star_systems: Array[StarSystemRes] = []
	for star_system in star_cluster.starSystems:
		new_star_systems.append(StarSystemRes.create_from_json(star_system))
	
	var new_star_cluster: StarClusterRes = new()
	new_star_cluster.star_systems = new_star_systems
	return new_star_cluster
