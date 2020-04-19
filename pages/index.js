import React from 'react';
import { AppBar, Toolbar, Typography, Button, Box, Card, Dialog, DialogTitle, TextField, DialogContent, DialogActions, DialogContentText } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import io from 'socket.io-client';
import Rooms from '../src/Rooms';

export const SocketContext = React.createContext();

const useStyles = makeStyles((theme) => ({
	root: {
		height: '100%'
	},
	login: {
		marginRight: theme.spacing(2),
		marginLeft: 'auto'
	},
	dotted: {
		border: '2px dashed #424242',
		background: 'transparent',
		transition: '.2s',
		minWidth: 300,
		minHeight: 200,
		width: '75vw',
		height: '75vh',
		margin: '50px auto',
		'&:hover': {
			cursor: 'pointer',
			background: '#4242422d'
		},
		'& > div': {
			display: 'block',
			top: '50%',
			left: '50%',
			position: 'relative',
			transform: 'translate(-50%, -50%)',
			color: 'grey',
			textAlign: 'center',
			fontSize: '48px'
		}
	}
}));

function randomColor() {
	return ['#1abc9c', '#2ecc71', '#3498db', '#9b59b6', '#f1c40f', '#e67e22', '#e74c3c'][Math.floor(Math.random() * 7)];
}

export default function HomePage() {
	const classes = useStyles();
	const [inRoom, setInRoom] = React.useState(null);
	const [rooms, setRooms] = React.useState([]);
	const [error, setError] = React.useState(null);

	const socket = React.useRef(null);
	React.useEffect(() => {
		socket.current = io();
		socket.current.on("update-rooms", ({ rooms }) => {
			setRooms(rooms);
		});
		socket.current.on("join-room", (id) => {
			setInRoom(id);
		});
		socket.current.on("leave-room", () => {
			setInRoom(null);
		});
		socket.current.on("err", (msg) => {
			setError(msg);
		});
		return () => socket.current.disconnect();
	}, []);

	const [createRoomOpen, setCreateRoomOpen] = React.useState(false);
	const [newRoomColor, setNewRoomColor] = React.useState(randomColor());
	const [newRoomName, setNewRoomName] = React.useState("New Classroom");

	const createRoom = () => {
		socket.current.emit("create-room", {
			name: newRoomName,
			color: newRoomColor
		});
		setCreateRoomOpen(false);
	}
	return (
		<Box className={classes.root}>
			<AppBar position="static">
				<Toolbar>
					<Typography variant="h4">
						Classroom
    			</Typography>
					<Button color="inherit" className={classes.login}>Login</Button>
				</Toolbar>
			</AppBar>
			<SocketContext.Provider value={socket.current}>
				<Rooms
					inRoom={inRoom}
					rooms={rooms.filter(r => r.people.length > 0)}
					onClick={({ id }) => socket.current.emit("join-room", id)}
					onExit={() => socket.current.emit("leave-room", inRoom)}
					onCreateRoom={() => {
						setNewRoomName("New Classroom");
						setNewRoomColor(randomColor());
						setCreateRoomOpen(true);
					}}
				/>
			</SocketContext.Provider>
			<Dialog open={createRoomOpen} onClose={() => setCreateRoomOpen(false)}>
				<DialogTitle>Create Classroom</DialogTitle>
				<DialogContent>
					<TextField label="Name" variant="outlined" fullWidth value={newRoomName} onChange={(ev) => setNewRoomName(ev.target.value)} />
				</DialogContent>
				<DialogActions>
					<Button onClick={() => setCreateRoomOpen(false)}>Cancel</Button>
					<Button onClick={createRoom}>Create</Button>
				</DialogActions>
			</Dialog>
			<Dialog open={error !== null} onClose={() => setError(null)}>
				<DialogContent>
					<DialogContentText>{error}</DialogContentText>
				</DialogContent>
				<DialogActions>
					<Button onClick={() => setError(null)}>OK</Button>
				</DialogActions>
			</Dialog>
		</Box>
	);
}