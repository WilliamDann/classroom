import { Toolbar, Typography, Avatar, Card, IconButton, Drawer, List, ListItem, ListItemText, ListItemAvatar, Fade } from '@material-ui/core';
import { ExitToApp, AccountMultiple as People } from 'mdi-material-ui';
import { makeStyles } from '@material-ui/core/styles';
import CanvasDraw from "react-canvas-draw";
import ChatWindow from './ChatWindow'

const useStyles = makeStyles(() => ({
	root: {
		width: '100%',
		height: '100%',
		transition: '1s',
		backgroundColor: props => props.selected ? 'initial' : props.room.color,
		cursor: props => props.selected ? 'default' : 'pointer'
	},
	title: {
		flexGrow: 1
	},
	drawer: {
		width: 250
	}
}));

function RoomContents(props) {
	const { room, onClick, selected, onExit } = props;
	const classes = useStyles(props);
	const [drawerOpen, setDrawerOpen] = React.useState(false);
	return (
		<div style={props.style}>
					<Toolbar>
						<Typography variant="h6" className={classes.title}>{room.name}</Typography>
						<IconButton onClick={() => setDrawerOpen(true)} >
							<People />
						</IconButton>
						<IconButton onClick={onExit} >
							<ExitToApp />
						</IconButton>
					</Toolbar>
					<Drawer anchor='right' open={drawerOpen} onClose={() => setDrawerOpen(false)} >
						<List className={classes.drawer}>
							{room.people.map((person, i) => (
								<ListItem key={i} button>
									<ListItemAvatar><Avatar>{person[0].toUpperCase()}</Avatar></ListItemAvatar>
									<ListItemText>{person}</ListItemText>
								</ListItem>
							))}
						</List>
					</Drawer>
					<CanvasDraw></CanvasDraw>
					<ChatWindow items={[ 
						{name: "test", text:"test message!"}
					]}></ChatWindow>

		</div>
	);
}

export default function Room(props) {
	const { onClick, selected } = props;
	const classes = useStyles(props);

	if (props.room.id === '0')
	console.log(selected);
	return (
		<Card className={classes.root} onClick={selected ? null : onClick}>
			<Fade in={selected} timeout={1000} mountOnEnter={true} unmountOnExit={true}>
				<RoomContents {...props} />
			</Fade>
		</Card>
	);
}