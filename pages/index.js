import React from 'react';
import {
	AppBar, Toolbar, Typography, Button, Box, Card,
	Dialog, DialogTitle, TextField, DialogContent, DialogActions, DialogContentText,
	FormControlLabel, Switch
} from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import io from 'socket.io-client';
import Rooms from '../src/Rooms';
import { TwitterPicker } from "react-color";
import LoginDialog from '../src/LoginDialog';

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
	},
	colorPicker: {
		margin: '20px auto',
		background: '#252525 !important'
	}
}));

function randomColor() {
	return ['#1abc9c', '#2ecc71', '#3498db', '#9b59b6', '#f1c40f', '#e67e22', '#e74c3c'][Math.floor(Math.random() * 7)];
}
function getQuery(name) {
	if (!window) return null;
	var results = new RegExp('[\?&]' + name + '=([^&#]*)').exec(window.location.href);
	if (results == null) {
		return null;
	}
	else {
		return decodeURI(results[1]) || 0;
	}
}
export default function HomePage() {
	const [inRoom, setInRoom] = React.useState(null);
	const [rooms, setRooms] = React.useState([]);
	const [error, setError] = React.useState(null);
	const [name, setName] = React.useState(null);

	const socket = React.useRef(null);
	React.useEffect(() => {
		socket.current = io();
		socket.current.on("update-rooms", ({ rooms }) => {
			setRooms(rooms);
		});
		socket.current.on("join-room", (id) => {
			setRoomPass(null);
			setInRoom(id);
		});
		socket.current.on("leave-room", () => {
			setInRoom(null);
		});
		socket.current.on("err", (msg) => {
			setError(msg);
		});
		if (window.localStorage.nickname) {
			socket.current.emit('set-name', window.localStorage.nickname)
		}
		socket.current.on('ready', (name) => {
			setName(name);
		})
		socket.current.once('ready', () => {
			let c = getQuery('room');
			if (c) {
				joinRoom({ id: c });
			}
		})
		return () => socket.current.disconnect();
	}, []);
	const [loginOpen, setLoginOpen] = React.useState(false);

	const [createRoomOpen, setCreateRoomOpen] = React.useState(false);
	const [newRoomHidden, setNewRoomHidden] = React.useState(false);
	const [newRoomColor, setNewRoomColor] = React.useState(randomColor());
	const [newRoomName, setNewRoomName] = React.useState("New Classroom");
	const [newRoomPass, setNewRoomPass] = React.useState("");

	const [roomPass, setRoomPass] = React.useState(null);
	const [roomId, setRoomId] = React.useState(null);

	const createRoom = () => {
		socket.current.emit("create-room", {
			name: newRoomName,
			color: newRoomColor,
			hidden: newRoomHidden,
			password: newRoomHidden ? '' : newRoomPass
		});
		setCreateRoomOpen(false);
	}
	const joinRoom = (room) => {
		if (room.password) {
			setRoomPass('');
			setRoomId(room.id);
		} else {
			socket.current.emit("join-room", { id: room.id });
		}
	}
	const classes = useStyles();
	return (
		<Box className={classes.root}>
			<AppBar position="static">
				<Toolbar>
					<Typography variant="h4">
						Classroom
    			</Typography>
					{!inRoom && <Button color="inherit" className={classes.login} onClick={() => setLoginOpen(true)}>Login</Button>}
				</Toolbar>
			</AppBar>
			<SocketContext.Provider value={socket.current}>
				{name ?
					<Rooms
						inRoom={inRoom}
						rooms={rooms.filter(r => r.people.length > 0)}
						onClick={joinRoom}
						onExit={() => socket.current.emit("leave-room", inRoom)}
						onCreateRoom={() => {
							setNewRoomName("New Classroom");
							setNewRoomPass("");
							let c = randomColor();
							setNewRoomColor(c);
							setNewRoomHidden(false);
							setCreateRoomOpen(true);
						}}
					/> :
					<Typography style={{marginTop: 10}} align="center" variant="h6">
						<Button onClick={() => setLoginOpen(true)}>LOGIN</Button> to access Classroom
					</Typography>}
			</SocketContext.Provider>
			<Dialog open={createRoomOpen} onClose={() => setCreateRoomOpen(false)}>
				<DialogTitle>Create Classroom</DialogTitle>
				<DialogContent>
					<TextField label="Name" variant="outlined" fullWidth value={newRoomName} onChange={(ev) => setNewRoomName(ev.target.value)} />
					<TextField label="Password" disabled={newRoomHidden} variant="outlined" fullWidth value={newRoomHidden ? '' : newRoomPass} onChange={(ev) => setNewRoomPass(ev.target.value)} style={{ marginTop: 20, marginBottom: 20 }} />
					<FormControlLabel
						control={
							<Switch
								checked={newRoomHidden}
								onChange={(ev) => setNewRoomHidden(ev.target.checked)}
								name="hiddenRoom"
								color="secondary"
							/>
						}
						label="Hide Room"
					/>
					<TwitterPicker className={classes.colorPicker} triangle="hide" color={newRoomColor} onChangeComplete={(c) => { setNewRoomColor(c.hex) }} colors={['#e74c3c', '#e67e22', '#f1c40f', '#2ecc71', '#1abc9c', '#3498db', '#9b59b6']} />
				</DialogContent>
				<DialogActions>
					<Button onClick={() => setCreateRoomOpen(false)}>Cancel</Button>
					<Button style={{ color: newRoomColor }} onClick={createRoom}>Create</Button>
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
			<Dialog open={roomPass !== null} onClose={() => setRoomPass(null)}>
				<DialogTitle>Enter Room Password</DialogTitle>
				<DialogContent>
					<TextField label="Password" variant="outlined" fullWidth value={roomPass} onChange={(ev) => setRoomPass(ev.target.value)} />
				</DialogContent>
				<DialogActions>
					<Button onClick={() => setRoomPass(null)}>Cancel</Button>
					<Button onClick={() => socket.current.emit("join-room", { id: roomId, password: roomPass })}>Join</Button>
				</DialogActions>
			</Dialog>
			<LoginDialog open={loginOpen} onClose={() => setLoginOpen(false)} onSubmit={(nick) => {
				setLoginOpen(false);
				localStorage.nickname = nick;
				socket.current.name = nick;
				socket.current.emit('set-name', nick);
			}} />
		</Box>
	);
}