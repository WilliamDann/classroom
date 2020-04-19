import React from 'react';
import {
	AppBar, Toolbar, Typography, Button, Box, Card,
	Dialog, DialogTitle, TextField, DialogContent, DialogActions, DialogContentText,
	FormControlLabel, Switch
} from '@material-ui/core';

function getInitialNick() {
	if (typeof window === 'undefined') {
		return '';
	} else {
		return localStorage.nickname || '';
	}
}

export default function LoginDialog({ open, onClose, onSubmit }) {
	const [nick, setNick] = React.useState(getInitialNick());
	return (
		<Dialog open={open} onClose={onClose}>
			<DialogTitle>Login</DialogTitle>
			<DialogContent>
				<TextField autoFocus label="Nickname" variant="outlined" fullWidth value={nick} onChange={(ev) => setNick(ev.target.value)} />
			</DialogContent>
			<DialogActions>
				<Button onClick={onClose}>Cancel</Button>
				<Button onClick={() => onSubmit(nick)}>Save</Button>
			</DialogActions>
		</Dialog>
	);
}