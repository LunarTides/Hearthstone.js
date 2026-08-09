extends Viewer

@export var planet: PlanetRes:
	set(value):
		planet = value
		_update_ui()

@export_category("UI Nodes")
@export var name_label: Label
@export var moons_label: Label

# Called when the node enters the scene tree for the first time.
func _ready() -> void:
	super()


# Called every frame. 'delta' is the elapsed time since the previous frame.
func _process(delta: float) -> void:
	super(delta)


func _update_ui() -> void:
	if not is_instance_valid(planet):
		return
	
	name_label.text = planet.name
	moons_label.text = "%d Moons" % planet.moons.size()
