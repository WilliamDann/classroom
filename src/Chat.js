import { makeStyles } from '@material-ui/core/styles';
import { List, ListItem, ListItemAvatar, ListItemText, Avatar, TextField, Box, InputAdornment, IconButton, Typography } from '@material-ui/core';
import { Send } from 'mdi-material-ui';
import moment from 'moment';
import { SocketContext } from '../pages/index';


const useStyles = makeStyles((theme) => ({
	list: {
		flexGrow: 1
	}
}));

function ChatMessage({ message }) {
	const timestampString = moment(message.timestamp).format("LTS");
	let body;
	switch (message.type) {
		case "chat":
			body =
				<ListItemText
					disableTypography
					primary={<Typography style={message.important ? { color: '#9b59b6', fontWeight: 'bold' } : {}}>{message.author}</Typography>}
					secondary={<Typography>{message.text}</Typography>}
				/>;
			break;
		case "create":
			body =
				<ListItemText
					primary="Room Created"
					secondary={timestampString}
				/>;
			break;
		case "join":
			body =
				<ListItemText
					primary={`${message.author} joined`}
					secondary={timestampString}
				/>;
			break;
		case "leave":
			body =
				<ListItemText
					primary={`${message.author} left`}
					secondary={timestampString}
				/>;
			break;
	}
	return (
		<ListItem title={timestampString}>
			<ListItemAvatar>
				<Avatar style={message.important ? { backgroundColor: '#9b59b6' } : {}}>{message.author[0].toUpperCase()}</Avatar>
			</ListItemAvatar>
			{body}
		</ListItem>
	)
}

export function Chat() {
	const classes = useStyles();
	const [history, setHistory] = React.useReducer((state, action) => state.concat(action), []);
	const [message, setMessage] = React.useState('');

	const socket = React.useContext(SocketContext);
	React.useEffect(() => {
		const chat = (message) => {
			setHistory(message);
		};
		socket.on('chat', chat);
		return () => socket.off('chat', chat);
	}, [socket]);

	const sendMessage = () => {
		if (!message) return;
		socket.emit('chat', message);
		setMessage('');
	}

	return (
		<Box display="flex" flexDirection="column" height="100%">
			<List className={classes.list}>
				{history.map((message) => (
					<ChatMessage key={message.id} message={message} />
				))}
			</List>
			<TextField
				variant="filled"
				label="Message"
				color="secondary"
				value={message}
				onKeyDown={(e) => e.keyCode === 13 && sendMessage()}
				onChange={(ev) => setMessage(ev.target.value)}
				InputProps={{
					endAdornment: (<InputAdornment position="end">
						<IconButton onClick={sendMessage}>
							<Send />
						</IconButton>
					</InputAdornment>)
				}}
			/>
		</Box>
	);
}