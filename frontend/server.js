const app = require('express')()
const server = require('http').Server(app)
const io = require('socket.io')(server)
const next = require('next')

const port = parseInt(process.env.PORT, 10) || 3000
const dev = process.env.NODE_ENV !== 'production'
const nextApp = next({ dev })
const nextHandler = nextApp.getRequestHandler();

// fake DB
const sockets = new Set();

io.on('connection', socket => {
	if (!sockets.has(socket.id)) {
		console.log("[CONNECT]", socket.id);
		sockets.add(socket.id);

		socket.emit("update-user-list", {
			users: Array.from(sockets.values())
		});
		socket.broadcast.emit("update-user-list", {
			users: Array.from(sockets.values())
		});
		socket.on("call-user", data => {
			console.log("Call from", socket.id, "to", data.to);
			socket.to(data.to).emit("call-made", {
				offer: data.offer,
				socket: socket.id
			});
		});
		socket.on("make-answer", data => {
			console.log("Answer from", socket.id, "to", data.to);
			socket.to(data.to).emit("answer-made", {
				socket: socket.id,
				answer: data.answer
			});
		});

		socket.on("disconnect", () => {
			console.log("[DISCONNECT]", socket.id);
			sockets.delete(socket.id);
			socket.broadcast.emit("update-user-list", {
				users: Array.from(sockets.values())
			});
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