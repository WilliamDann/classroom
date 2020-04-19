const app = require('express')()
const server = require('http').Server(app)
const io = require('socket.io')(server)
const next = require('next')
const uuid = require('uuid').v4;

const port = parseInt(process.env.PORT, 10) || 3000
const dev = process.env.NODE_ENV !== 'production'
const nextApp = next({ dev })
const nextHandler = nextApp.getRequestHandler();

// fake DB
const rooms = {};
const sockets = new Set();

io.on('connection', socket => {
	if (!sockets.has(socket.id)) {
		sockets.add(socket.id);
		let socketRoom = null;
		console.log("[CONNECT]", socket.id);
		socket.emit("update-rooms", {
			rooms: Object.values(rooms)
		});
		socket.on("create-room", (room) => {
			if (!room.name || !room.color) return;
			const id = uuid();
			console.log("[CREATE]", socket.id, room.name, id);
			rooms[id] = {
				id,
				name: room.name,
				color: room.color,
				people: [socket.id],
				owner: socket.id
			};
			io.emit("update-rooms", {
				rooms: Object.values(rooms)
			});
			socket.join(id);
			socketRoom = id;
			socket.emit("join-room", id);
		});
		socket.on("join-room", id => {
			console.log("[JOIN]", socket.id, id);
			const room = rooms[id];
			if (socketRoom) {
				socket.emit("err", "You are in a different room");
				return;
			}
			if (!room) {
				socket.emit("err", "Nonexistant room");
				return;
			}
			socketRoom = id;
			socket.leave('lobby');
			room.people.push(socket.id);
			socket.join(id); socketRoom = id;
			io.emit("update-rooms", {
				rooms: Object.values(rooms)
			});
			socket.emit("join-room", id);
		});
		socket.on("leave-room", (id) => {
			console.log("[LEAVE]", socket.id, id);
			const room = rooms[id];
			if (!socketRoom) {
				socket.emit("err", "You are not in that room");
				socket.emit("leave-room");
				return;
			}
			if (!room) {
				socket.emit("err", "Nonexistant room");
				return;
			}
			room.people = room.people.filter(id => id !== socket.id);
			socket.leave(id); socketRoom = null;
			socket.emit("leave-room");
			socketRoom = null;
			if (room.owner === socket.id) {
				delete rooms[id];
				socket.to(id).emit("leave-room");
			}
			io.emit("update-rooms", {
				rooms: Object.values(rooms)
			});
		});

		// socket.emit("update-user-list", {
		// 	users: Array.from(sockets.values())
		// });
		// socket.broadcast.emit("update-user-list", {
		// 	users: Array.from(sockets.values())
		// });
		// socket.on("call-user", data => {
		// 	console.log("Call from", socket.id, "to", data.to);
		// 	socket.to(data.to).emit("call-made", {
		// 		offer: data.offer,
		// 		socket: socket.id
		// 	});
		// });
		// socket.on("make-answer", data => {
		// 	console.log("Answer from", socket.id, "to", data.to);
		// 	socket.to(data.to).emit("answer-made", {
		// 		socket: socket.id,
		// 		answer: data.answer
		// 	});
		// });

		socket.on("disconnect", () => {
			console.log("[DISCONNECT]", socket.id);
			sockets.delete(socket.id);
			const id = socketRoom;
			const room = rooms[id];
			if (room) {
				room.people = room.people.filter(id => id !== socket.id);
				if (room.owner === socket.id) {
					delete rooms[id];
					socket.to(id).emit("leave-room");
				}
				io.emit("update-rooms", {
					rooms: Object.values(rooms)
				});
			}
		});
	}
})

nextApp.prepare().then(() => {
	app.get('*', (req, res) => {
		return nextHandler(req, res)
	});

	server.listen(port, (err) => {
		if (err) throw err
		console.log(`> Ready on http://localhost:${port}`)
	})
})