extends Resource
class_name GalaxyRes

@export var star_clusters: Array[StarClusterRes]:
	set(value):
		if star_clusters != value:
			star_clusters = value
			changed.emit()


static func create_from_json(galaxy) -> GalaxyRes:
	var new_star_clusters: Array[StarClusterRes] = []
	for star_cluster in galaxy.starClusters:
		new_star_clusters.append(StarClusterRes.create_from_json(star_cluster))
	
	var new_galaxy: GalaxyRes = new()
	new_galaxy.star_clusters = new_star_clusters
	return new_galaxy
