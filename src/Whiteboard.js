import { makeStyles, withStyles } from '@material-ui/core/styles';
import { ToggleButton, ToggleButtonGroup } from '@material-ui/lab';
import { Pen, Eraser, FormatColorFill, MenuDown, CheckboxMultipleBlankCircleOutline, Undo, DeleteOutline } from 'mdi-material-ui';
import { Divider, ButtonGroup, Paper, Button, Popover, ClickAwayListener, Menu, MenuItem } from '@material-ui/core';
import ResizeObserver from 'resize-observer-polyfill';

import CanvasDraw from "react-canvas-draw";
import { BlockPicker } from "react-color";

function useMeasure() {
	const ref = React.useRef()
	const [bounds, set] = React.useState({ left: 0, top: 0, width: 0, height: 0 })
	const [ro] = React.useState(() => new ResizeObserver(([entry]) => set(entry.contentRect)))
	React.useEffect(() => (ro.observe(ref.current), () => ro.disconnect()), [])
	return [{ ref }, bounds]
}

const useStyles = makeStyles((theme) => ({
	root: {
		width: '100%',
		height: '100%',
		padding: theme.spacing(2),
	},
	paper: {
		display: 'flex',
		border: `1px solid ${theme.palette.divider}`,
		flexWrap: 'wrap',
	},
	divider: {
		alignSelf: 'stretch',
		height: 'auto',
		margin: theme.spacing(1, 0.5),
	},
	popOver: {
		background: 'transparent'
	}
}));
const styler = withStyles((theme) => ({
	grouped: {
		margin: theme.spacing(0.5),
		border: 'none',
		padding: theme.spacing(0, 1),
		'&:not(:first-child)': {
			borderRadius: theme.shape.borderRadius,
		},
		'&:first-child': {
			borderRadius: theme.shape.borderRadius,
		},
	},
}));
const StyledToggleButtonGroup = styler(ToggleButtonGroup);
const StyledButtonGroup = styler(ButtonGroup);

export function Whiteboard() {
	var [bind, { width, height }] = useMeasure();
	const classes = useStyles({ width, height });
	const canvas = React.useRef();

	const [color, setColor] = React.useState('#000000');
	const [tempColor, setTempColor] = React.useState('#000000');
	const [colorPickerOpen, setColorPickerOpen] = React.useState(false);
	const [colorAnchor, setColorAnchor] = React.useState(null);

	const [brushSize, setBrushSize] = React.useState(10);
	const [sizePickerOpen, setSizePickerOpen] = React.useState(false);
	const [sizeAnchor, setSizeAnchor] = React.useState(null);

	const [tool, setTool] = React.useState('pen');

	const handleColorOpen = (ev) => {
		setColorAnchor(ev.currentTarget);
		setColorPickerOpen(true);
	};

	const handleSizeOpen = (ev) => {
		if (sizePickerOpen) return;
		setSizeAnchor(ev.currentTarget);
		setSizePickerOpen(true);
	};
	height = Math.max(height, 50);
	width = Math.max(width, 50);
	console.log(height, width);
	return (
		<div className={classes.root}  {...bind}>
			<Paper elevation={0} className={classes.paper}>
				<StyledToggleButtonGroup size="small" exclusive value={tool} onChange={(_, t) => setTool(t)}>
					<ToggleButton value="pen">
						<Pen />
					</ToggleButton>
					<ToggleButton value="eraser">
						<Eraser />
					</ToggleButton>
				</StyledToggleButtonGroup>
				<Divider orientation="vertical" className={classes.divider} />
				<StyledButtonGroup size="small">
					<Button onClick={() => canvas.current.undo()}>
						<Undo />
					</Button>
					<Button>
						<DeleteOutline onClick={() => canvas.current.clear()} />
					</Button>
				</StyledButtonGroup>
				<Divider orientation="vertical" className={classes.divider} />
				<StyledButtonGroup size="small">
					<Button value="left" onClick={handleSizeOpen}>
						<CheckboxMultipleBlankCircleOutline />
						{brushSize}
						<MenuDown />
						<Menu anchorEl={sizeAnchor} open={sizePickerOpen} onClose={() => setSizePickerOpen(false)}>
							{[4, 8, 16, 32, 48].map(size => (
								<MenuItem onClick={() => { setBrushSize(size); setSizePickerOpen(false); }} key={size}>{size}</MenuItem>
							))}
						</Menu>
					</Button>
					<Button value="left" onClick={handleColorOpen}>
						<FormatColorFill style={{ borderBottom: `4px solid ${color}` }} />
						<MenuDown />
						<Popover
							open={colorPickerOpen}
							onClose={() => setColorPickerOpen(false)}
							anchorEl={colorAnchor}
							anchorOrigin={{
								vertical: 'bottom',
								horizontal: 'center',
							}}
							transformOrigin={{
								vertical: 'top',
								horizontal: 'center',
							}}>
							<ClickAwayListener onClickAway={() => setColorPickerOpen(false)}>
								<BlockPicker color={tempColor} onSwatchHover={(c) => setTempColor(c.hex)} onChangeComplete={(c) => { setColor(c.hex); setTempColor(c.hex); setColorPickerOpen(false); }} colors={['#e74c3c', '#e67e22', '#f1c40f', '#2ecc71', '#1abc9c', '#3498db', '#9b59b6', '#ecf0f1', '#95a5a6', '#000000']} />
							</ClickAwayListener>
						</Popover>
					</Button>
				</StyledButtonGroup>
			</Paper>
			<CanvasDraw
				className={classes.canvas}
				ref={canvas}
				brushRadius={brushSize}
				brushColor={color}
				erase={tool === 'eraser'}
				canvasHeight={height}
				canvasWidth={width}
			/>
		</div>
	);
}