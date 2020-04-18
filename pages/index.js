import { AppBar, Toolbar, Typography, Button, Box, Card } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { GoogleClassroom } from 'mdi-material-ui';
import dynamic from 'next/dynamic';
import Rooms from '../src/Rooms';

// const Rooms = dynamic(() => import('../src/Rooms'), { ssr: false });

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

export default function HomePage() {
	const classes = useStyles();
	const [inRoom, setInRoom] = React.useState('0');

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
			<Rooms
				inRoom={inRoom}
				rooms={[
					{ id: '0', color: 'red', name: "Test Room", people: ["Otto", "William"] },
					{ id: '1', color: 'orange' },
					{ id: '2', color: 'yellow' },
					{ id: '3', color: 'green' },
					{ id: '4', color: 'blue' },
					{ id: '5', color: 'indigo' },
					{ id: '6', color: 'purple' },
					{ id: '7', color: 'violet' },
				]}
				onClick={({ id }) => setInRoom(id)}
				onExit={() => setInRoom(null)}
			/>
		</Box>
	);
}