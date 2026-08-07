declare var self: Worker;

const websockets: Bun.ServerWebSocket[] = [];

Bun.serve({
	port: 29979,
	fetch: (req, server) => {
		if (!server.upgrade(req)) {
			return new Response("Upgrade failed", { status: 500 });
		}
	},
	websocket: {
		message(ws, message) {
			// TODO: Handle message.
			console.log(message);
		},
		open(ws) {
			// TODO: Handle disconnects.
			console.log("Connected to Observatory client.");
			websockets.push(ws);
		},
		close(ws, code, message) {
			game.data.remove(websockets, ws);
		},
		drain(ws) {},
	},
});

self.onmessage = (event: MessageEvent) => {
	if (typeof event.data === "string") {
		if (event.data.startsWith("msg ")) {
			const message = event.data.split("msg ")[1];
			for (const ws of websockets) {
				ws.send(message);
			}
		}
	}
};
