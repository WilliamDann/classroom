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
const names = {};
const rooms = {};
const sockets = new Set();

function broadcastRooms() {
	Object.values(io.sockets.sockets).forEach(socket => {
		socket.emit("update-rooms", {
			rooms: Object.values(rooms)
				.filter(room => !room.hidden || room.people.includes(socket.id))
				.map(room => ({
					...room,
					password: !!room.password,
					names: room.people.includes(socket.id) ? room.people.map(p => names[p]) : []
				}))
		});
	})
}
io.on('connection', socket => {
	if (!sockets.has(socket.id)) {
		sockets.add(socket.id);
		socket.on('set-name', name => {
			if (!name) {
				socket.emit("err", "Invalid Name");
				return;
			}
			names[socket.id] = name;
			socket.emit('ready', name);
		});
		let socketRoom = null;
		console.log("[CONNECT]", socket.id);
		socket.emit("update-rooms", {
			rooms: Object.values(rooms)
				.filter(room => !room.hidden)
		});
		socket.on("create-room", (room) => {
			if (!names[socket.id]) return;
			if (!room.name || !room.color) return;
			const id = uuid();
			console.log("[CREATE]", socket.id, room.name, id);
			rooms[id] = {
				id,
				name: room.name,
				color: room.color,
				hidden: room.hidden,
				password: room.password,
				people: [socket.id],
				owner: socket.id
			};
			broadcastRooms(io, socket);
			socket.join(id);
			socketRoom = id;
			socket.emit("join-room", id);
			const message = {
				type: 'join',
				id: uuid(),
				timestamp: new Date().getTime(),
				author: socket.id
			};
			io.to(socketRoom).emit('chat', message);
		});
		socket.on("join-room", ({ id, password }) => {
			if (!names[socket.id]) return;
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
			if (room.password && room.password !== password) {
				socket.emit("err", "Incorrect password");
				return;
			}
			socketRoom = id;
			socket.leave('lobby');
			room.people.push(socket.id);
			socket.join(id); socketRoom = id;
			broadcastRooms(io, socket);
			socket.emit("join-room", id);
			const message = {
				type: 'join',
				id: uuid(),
				timestamp: new Date().getTime(),
				author: socket.id
			};
			io.to(socketRoom).emit('chat', message);
		});
		socket.on("leave-room", (id) => {
			if (!names[socket.id]) return;
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
			broadcastRooms(io, socket);
			const message = {
				type: 'leave',
				id: uuid(),
				timestamp: new Date().getTime(),
				author: socket.id
			};
			io.to(id).emit('chat', message);
		});
		socket.on('chat', message => {
			if (!names[socket.id]) return;
			if (!socketRoom) {
				socket.emit("err", "You are not in a room");
			} else if (!message) {
				socket.emit("err", "Cannot send an empty message");
			} else {
				const room = rooms[socketRoom];
				if (!room) {
					socket.emit("err", "Nonexistant room");
					return;
				}
				const msg = {
					type: 'chat',
					id: uuid(),
					important: socket.id === room.owner,
					text: message,
					timestamp: new Date().getTime(),
					author: socket.id
				};
				io.to(socketRoom).emit('chat', msg);
			}
		});
		socket.on('whiteboard', data => {
			if (!names[socket.id]) return;
			if (!socketRoom) {
				socket.emit("err", "You are not in a room");
			} else if (!data) {
				socket.emit("err", "Cannot send empty data");
			} else {
				const room = rooms[socketRoom];
				if (!room) {
					socket.emit("err", "Nonexistant room");
					return;
				}
				if (room.owner !== socket.id) {
					socket.emit("err", "Cannot send whiteboard data as a student");
					return;
				}
				if (data.target) {
					socket.to(data.target).emit('whiteboard', {
						timestamp: new Date().getTime(),
						data: {
							type: data.type,
							lines: data.lines
						}
					});
				} else {
					socket.to(socketRoom).broadcast.emit('whiteboard', {
						timestamp: new Date().getTime(),
						data: {
							type: data.type,
							lines: data.lines
						}
					});

				}
			}
		});
		socket.on('join-video', () => {
			if (!names[socket.id]) return;
			if (!socketRoom) {
				socket.emit("err", "You are not in a room");
			} else {
				const room = rooms[socketRoom];
				if (!room) {
					socket.emit("err", "Nonexistant room");
					return;
				}
				socket.to(socketRoom).broadcast.emit('join-video', {
					id: socket.id
				});
			}
		});
		socket.on('leave-video', () => {
			if (!names[socket.id]) return;
			if (!socketRoom) {
				socket.emit("err", "You are not in a room");
			} else {
				const room = rooms[socketRoom];
				if (!room) {
					socket.emit("err", "Nonexistant room");
					return;
				}
				socket.to(socketRoom).broadcast.emit('leave-video', {
					id: socket.id
				});
			}
		});
		socket.on("call-user", data => {
			console.log("Call from", socket.id, "to", data.to);
			socket.to(data.to).emit("call-made", {
				offer: data.offer,
				socket: { id: socket.id }
			});
		});
		socket.on("make-answer", data => {
			console.log("Answer from", socket.id, "to", data.to);
			socket.to(data.to).emit("answer-made", {
				socket: socket.id,
				answer: data.answer
			});
		});

		// socket.emit("update-user-list", {
		// 	users: Array.from(sockets.values())
		// });
		// socket.broadcast.emit("update-user-list", {
		// 	users: Array.from(sockets.values())
		// });

		socket.on("disconnect", () => {
			console.log("[DISCONNECT]", socket.id);
			sockets.delete(socket.id);
			delete names[socket.id];
			const id = socketRoom;
			const room = rooms[id];
			if (room) {
				room.people = room.people.filter(id => id !== socket.id);
				if (room.owner === socket.id) {
					delete rooms[id];
					socket.to(id).emit("leave-room");
				}
				broadcastRooms(io, socket);
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