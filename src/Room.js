import { Toolbar, Typography, Avatar, Card, IconButton, Drawer, List, ListItem, ListItemText, ListItemAvatar, Fade } from '@material-ui/core';
import { ExitToApp, AccountMultiple as People } from 'mdi-material-ui';
import { makeStyles } from '@material-ui/core/styles';
import { Responsive } from 'react-grid-layout';

import { Whiteboard } from './Whiteboard';

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
	},
	grid: {
		'&>.react-grid-item': {
			boxSizing: 'border-box',
			'&.react-draggable-dragging': {
				zIndex: 3
			},
			'&>.drag-handle': {
				position: 'absolute',
				width: '100%',
				height: 20,
				top: 2,
				right: 0,
				cursor: 'move',
				borderTop: '2px solid rgba(255, 255, 255, 0.4)'
			},
			'&>.react-resizable-handle': {
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
					borderRight: '2px solid rgba(255, 255, 255, 0.4)',
					borderBottom: '2px solid rgba(255, 255, 255, 0.4)'
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
	}
}));

function RoomContents(props) {
	const { room, onClick, selected, onExit, height, width } = props;
	const classes = useStyles(props);
	const [drawerOpen, setDrawerOpen] = React.useState(false);

	const layout = [
		{ i: 'whiteboard', x: 0, y: 0, w: 2, h: 4, minW: 2 },
		{ i: 'chat', x: 2, y: 2, w: 1, h: 2 },
		{ i: 'video', x: 2, y: 0, w: 2, h: 2 },
	];
	const smallLayout = [
		{ i: 'whiteboard', x: 0, y: 0, w: 2, h: 2, minW: 2 },
		{ i: 'chat', x: 0, y: 2, w: 1, h: 2 },
		{ i: 'video', x: 1, y: 2, w: 1, h: 2 },
	];

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
				draggableHandle=".drag-handle"
			>
				<Card key="whiteboard"><span className="drag-handle"></span><Whiteboard /></Card>
				<Card key="chat"><span className="drag-handle"></span></Card>
				<Card key="video"><span className="drag-handle"></span>video</Card>
			</Responsive>
		</div>
	);
}

export default function Room(props) {
	const { onClick, selected } = props;
	const classes = useStyles(props);
	return (
		<Card className={classes.root} onClick={selected ? null : onClick}>
			<Fade in={selected} timeout={1000} mountOnEnter={true} unmountOnExit={true} style={{ width: '100%', height: '100%', overflow: 'hidden' }}>
				<RoomContents {...props} />
			</Fade>
		</Card>
	);
}