import { makeStyles } from '@material-ui/core/styles';
import { List, ListItem, ListItemAvatar, ListItemText, Avatar, TextField, Box, InputAdornment, IconButton } from '@material-ui/core';
import { Send } from 'mdi-material-ui';
import moment from 'moment';

const useStyles = makeStyles((theme) => ({
	list: {
		flexGrow: 1
	}
}));

function ChatMessage({ message }) {
	return (
		<ListItem title={moment(message.timestamp).format("LTS")}>
			<ListItemAvatar>
				<Avatar>{message.author[0].toUpperCase()}</Avatar>
			</ListItemAvatar>
			<ListItemText
				primary={message.author}
				secondary={message.text}
			/>
		</ListItem>
	)
}

export function Chat() {
	const classes = useStyles();
	return (
		<Box display="flex" flexDirection="column" height="100%">
			<List className={classes.list}>
				<ChatMessage message={{ author: "Otto", text: "Hello World", timestamp: new Date() }} />
			</List>
			<TextField
				variant="filled"
				label="Message"
				color="secondary"
				InputProps={{
					endAdornment: <InputAdornment position="end"><IconButton><Send /></IconButton></InputAdornment>
				}}
			/>
		</Box>
	);
}