extends Viewer

@export var moon: MoonRes:
	set(value):
		moon = value
		_update_ui()

@export_category("UI Nodes")
@export var name_label: Label
@export var bytes_label: Label

# Called when the node enters the scene tree for the first time.
func _ready() -> void:
	super()


# Called every frame. 'delta' is the elapsed time since the previous frame.
func _process(delta: float) -> void:
	super(delta)


func _update_ui() -> void:
	if not is_instance_valid(moon):
		return
	
	# TODO: Show more info
	name_label.text = "%s (%s)" % [moon.name, moon.type]
	bytes_label.text = "File Size: %d bytes" % moon.bytes
