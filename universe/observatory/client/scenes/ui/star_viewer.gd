extends Viewer

@export var star: StarRes:
	set(value):
		star = value
		_update_ui()

@export_category("UI Nodes")
@export var name_label: Label

# Called when the node enters the scene tree for the first time.
func _ready() -> void:
	super()


# Called every frame. 'delta' is the elapsed time since the previous frame.
func _process(delta: float) -> void:
	super(delta)


func _update_ui() -> void:
	if not is_instance_valid(star):
		return
	
	name_label.text = star.name
