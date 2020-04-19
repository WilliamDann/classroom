import { Toolbar, Typography, Avatar, Card, IconButton, Drawer, List, ListItem, ListItemText, ListItemAvatar, Fade, Box, Button } from '@material-ui/core';
import { ExitToApp, AccountMultiple as People, Table, TableEdit, Plus } from 'mdi-material-ui';
import { makeStyles } from '@material-ui/core/styles';
import { Responsive } from 'react-grid-layout';

import { Whiteboard } from './Whiteboard';
import { Chat } from './Chat';

const useStyles = makeStyles(() => ({
	root: {
		width: '100%',
		height: '100%',
		transition: '1s',
		backgroundColor: props => props.selected ? 'initial' : props.room.color,
		cursor: props => props.selected ? 'default' : 'pointer'
	},
	placeholder: {
		width: '100%',
		height: '100%',
		transition: '.2s',
		border: '2px dashed #525252',
		background: 'transparent',
		'&:hover': {
			background: '#5252522d',
			cursor: 'pointer'
		},
		'&>.MuiSvgIcon-root': {
			display: 'block',
			top: '50%',
			left: '50%',
			position: 'relative',
			transform: 'translate(-50%, -50%)',
			color: '#525252',
			textAlign: 'center',
			fontSize: '48px'
		}
	},
	title: {
		flexGrow: 1
	},
	drawer: {
		width: 300
	},
	grid: {
		'&>.react-grid-item': {
			boxSizing: 'border-box',
			'&.react-draggable-dragging': {
				zIndex: 3
			},
			'&>.react-resizable-handle': {
				display: ({ edit }) => edit ? 'block' : 'none',
				position: 'absolute',
				width: 20,
				height: 20,
				bottom: 0,
				right: 0,
				cursor: 'se-resize',
				'&::after': {
					content: '""',
					position: 'absolute',
					right: 3,
					bottom: 3,
					width: 5,
					height: 5,
					borderRight: '2px solid white',
					borderBottom: '2px solid white'
				}
			}
		},
		'&>.react-grid-placeholder': {
			transition: '100ms',
			opacity: 0.2,
			background: 'red',
			userSelect: 'none',
			zIndex: 2,
		}
	},
	dragHandle: {
		position: 'absolute',
		width: '100%',
		height: '100%',
		cursor: 'move',
		background: 'rgba(255, 255, 255, 0.1)'
	}
}));

function RoomContents(props) {
	const { room, onClick, selected, onExit, height, width } = props;
	const [drawerOpen, setDrawerOpen] = React.useState(false);

	const layout = [
		{ i: 'whiteboard', x: 0, y: 0, w: 2, h: 4, minW: 2 },
		{ i: 'chat', x: 2, y: 2, w: 1, h: 2 },
		{ i: 'video', x: 2, y: 0, w: 2, h: 2 },
		{ i: 'selfvideo', x: 4, y: 0, w: 1, h: 1 },
	];
	const smallLayout = [
		{ i: 'whiteboard', x: 0, y: 0, w: 2, h: 2, minW: 2 },
		{ i: 'chat', x: 0, y: 2, w: 1, h: 2 },
		{ i: 'video', x: 1, y: 2, w: 1, h: 2 },
		{ i: 'selfvideo', x: 0, y: 4, w: 2, h: 1 },
	];

	const [editingLayout, setEditingLayout] = React.useState(false);

	const classes = useStyles({ ...props, edit: editingLayout });
	const editingShown = { display: editingLayout ? 'flex' : 'none' };
	const editingHidden = editingLayout ? { opacity: 0, pointerEvents: 'none', height: '100%', width: '100%' } : { height: '100%', width: '100%' };

	return (
		<div style={props.style}>
			<Toolbar>
				<Typography variant="h6" className={classes.title}>{room.name}{editingLayout && " - editing layout"}</Typography>
				<IconButton onClick={() => setEditingLayout(!editingLayout)} >
					{editingLayout ? <Table /> : <TableEdit />}
				</IconButton>
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
			<Responsive
				width={width - 30}
				breakpoints={{ xs: 800, xxs: 0 }}
				cols={{ xs: 4, xxs: 2 }}
				maxRows={4}
				className={classes.grid}
				layouts={{ xs: layout, xxs: smallLayout }}
				rowHeight={(height - 128) / 4}
				maxRows={4}
				margin={[0, 0]}
				containerPadding={[0, 0]}
				// compactType="horizontal"
				draggableHandle={"." + classes.dragHandle}
			>
				<Card key="whiteboard" variant="outlined">
					<Box style={editingShown} display="flex" justifyContent="center" height="100%" flexDirection="column">
						<span className={classes.dragHandle} />
						<Typography variant="h4" align="center">Whiteboard</Typography>
					</Box>
					<div style={editingHidden}>
						<Whiteboard room={room} />
					</div>
				</Card>
				<Card key="chat" variant="outlined">
					<Box style={editingShown} display="flex" justifyContent="center" height="100%" flexDirection="column">
						<span className={classes.dragHandle} />
						<Typography variant="h4" align="center">Chat</Typography>
					</Box>
					<div style={editingHidden}>
						<Chat />
					</div>
				</Card>
				<Card key="video" variant="outlined">
					<Box style={editingShown} display="flex" justifyContent="center" height="100%" flexDirection="column">
						<span className={classes.dragHandle} />
						<Typography variant="h4" align="center">Video</Typography>
					</Box>
					<div style={editingHidden}>
						Video
					</div>
				</Card>
				<Card key="selfvideo" variant="outlined">
					<Box style={editingShown} display="flex" justifyContent="center" height="100%" flexDirection="column">
						<span className={classes.dragHandle} />
						<Typography variant="h4" align="center">Webcam</Typography>
					</Box>
					<div style={editingHidden}>
						Self-Video
					</div>
				</Card>
			</Responsive>
		</div>
	);
}

export function PlaceholderRoom({ onClick }) {
	const classes = useStyles({ room: {} });
	return (
		<Card className={classes.placeholder} onClick={onClick}>
			<Plus fontSize='large' />
		</Card>
	);

}

export default function Room(props) {
	const { onClick, selected } = props;
	const classes = useStyles(props);
	return (
		<Card className={classes.root} onClick={selected ? null : onClick}>
			{!selected && <Box display="flex" flexDirection="column" height="100%" justifyContent="center" alignItems="center">
				<Typography variant="h6">{props.room.name}</Typography>
				<Typography variant="body1">{props.room.people.length} {props.room.people.length === 1 ? 'person' : 'people'}</Typography>
			</Box>}
			<Fade in={selected} timeout={1000} mountOnEnter={true} unmountOnExit={true} style={{ width: '100%', height: '100%', overflow: 'hidden' }}>
				<RoomContents {...props} />
			</Fade>
		</Card>
	);
}