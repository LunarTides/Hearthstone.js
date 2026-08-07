extends Node

signal string_packet_received(packet_text: String)
signal binary_packet_received(packet: PackedByteArray)
signal packet_sent(text: String)

var websocket_url := "ws://localhost:29979"
var socket = WebSocketPeer.new()

# Called when the node enters the scene tree for the first time.
func _ready() -> void:
	var err := socket.connect_to_url(websocket_url)
	if err == OK:
		print("Connecting to %s..." % websocket_url)
	else:
		push_error("Unable to connect to Observatory server.")
		set_process(false)


# Called every frame. 'delta' is the elapsed time since the previous frame.
func _process(delta: float) -> void:
	socket.poll()
	
	var state := socket.get_ready_state()
	if state == WebSocketPeer.STATE_OPEN:
		while socket.get_available_packet_count():
			var packet := socket.get_packet()
			if socket.was_string_packet():
				var packet_text := packet.get_string_from_utf8()
				handle_string_packet(packet_text)
			else:
				handle_binary_packet(packet)


func handle_string_packet(packet_text: String):
	# TODO: Actually handle packets sent from the server.
	print("Server: %s" % packet_text)
	string_packet_received.emit(packet_text)


func handle_binary_packet(packet: PackedByteArray):
	print("Server sent %d bytes." % packet.size())
	binary_packet_received.emit(packet)


func send(text: String):
	socket.send_text(text)
	packet_sent.emit(text)
