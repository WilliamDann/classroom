import React, { useState, useEffect, useRef } from 'react';
import { useTransition, a } from 'react-spring';
import ResizeObserver from 'resize-observer-polyfill';
import Room, { PlaceholderRoom } from './Room';
import { makeStyles } from '@material-ui/core/styles';

function useMedia(queries, values, defaultValue) {
	if (typeof window === 'undefined') {
		return defaultValue;
	}
	const match = () => values[queries.findIndex(q => window.matchMedia(q).matches)] || defaultValue
	const [value, set] = useState(match)
	useEffect(() => {
		const handler = () => set(match)
		window.addEventListener('resize', handler)
		return () => window.removeEventListener('resize', handler)
	}, [])
	return value
}
function useMeasure() {
	const ref = useRef()
	const [bounds, set] = useState({ left: 0, top: 0, width: 0, height: 0 })
	const [ro] = useState(() => new ResizeObserver(([entry]) => set(entry.contentRect)))
	useEffect(() => (ro.observe(ref.current), () => ro.disconnect()), [])
	return [{ ref }, bounds]
}

const useStyles = makeStyles(() => ({
	root: {
		position: 'relative',
		width: '100%',
		height: 'calc(100vh - 64px)',
		overflowX: 'hidden',
		overflowY: props => props.inRoom ? 'hidden' : 'auto',
	},
	item: {
		position: 'absolute',
		willChange: 'transform, width, height, opacity',
		padding: 15
	}
}));

export default function Rooms(props) {
	const { rooms, inRoom, onClick, onExit, onCreateRoom } = props;
	const classes = useStyles(props);
	const columns = useMedia(['(min-width: 1500px)', '(min-width: 1000px)', '(min-width: 600px)', '(min-width: 400px)'], [5, 4, 3, 2], 1);
	const [bind, { width, height }] = useMeasure();
	const itemHeight = 225;
	const items = rooms;

	let heights = new Array(columns).fill(inRoom ? height : 0);
	let gridItems = items.concat('new').map((child, i) => {
		if (inRoom === child.id) {
			return { room: child, xy: [0, 0], width, height };
		} else {
			const column = heights.indexOf(Math.min(...heights));
			const xy = [(width / columns) * column, (heights[column] += itemHeight) - itemHeight];
			return { room: child, xy, width: width / columns, height: itemHeight };
		}
	});
	const transitions = useTransition(gridItems, item => item.room.id, {
		from: ({ xy, width, height }) => ({ xy, width, height, opacity: 0 }),
		enter: ({ xy, width, height }) => ({ xy, width, height, opacity: 1 }),
		update: ({ xy, width, height }) => ({ xy, width, height }),
		leave: { height: 0, opacity: 0 },
		config: { mass: 5, tension: 500, friction: 100 },
		trail: 25
	});
	return (
		<div {...bind} className={classes.root}>
			{transitions.map(({ item, props: { xy, ...rest }, key }) => (
				<a.div key={key} className={classes.item} style={{ transform: xy.interpolate((x, y) => `translate3d(${x}px,${y}px,0)`), ...rest }}>
					{item.room === 'new' ?
						<PlaceholderRoom onClick={onCreateRoom} /> :
						<Room
							room={item.room}
							selected={inRoom === item.room.id}
							onClick={() => {
								bind.ref.current.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
								onClick(item.room);
							}}
							onExit={onExit}
							height={item.height}
							width={item.width}
						/>
					}
				</a.div>
			))}
		</div>
	);
}