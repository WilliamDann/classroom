import React from 'react';
import { SocketContext } from '../pages/index';
import { Button, Portal, Box, makeStyles } from '@material-ui/core';

function reduce(prevState, action) {
	if (action.add) {
		prevState[action.add] = true;
	}
	if (action.delete) {
		delete prevState[action.delete]
	}
	if (action.clear) return {};
	return { ...prevState };
}

export default function Video({ selfVideoContainer }) {
	const socket = React.useContext(SocketContext);
	const [remoteUsers, setRemoteUsers] = React.useReducer(reduce, {});
	const videoRefs = React.useRef({});
	const peerConnections = React.useRef({});
	const localVideoEl = React.useRef();
	const localStream = React.useRef();
	const inCall = React.useRef({});
	const [inVideo, setInVideo] = React.useState(false);
	const inVideoR = React.useRef(false);
	const [canJoinVideo, setCanJoinVideo] = React.useState(false);

	React.useEffect(() => {
		navigator.getUserMedia(
			{ video: { width: 240, height: 240 } },
			lS => {
				setCanJoinVideo(true);
				localStream.current = lS;
				localVideoEl.current.srcObject = localStream.current;
				socket.on('join-video', async (user) => {
					if (!inVideoR.current) return;
					setRemoteUsers({ add: user.id });
					const connection = new RTCPeerConnection();
					connection.ontrack = ({ streams: [stream] }) => {
						videoRefs.current[user.id].srcObject = stream;
					};
					peerConnections.current[user.id] = connection;
					localStream.current.getTracks().forEach(track => connection.addTrack(track, localStream.current));

					const offer = await connection.createOffer();
					await connection.setLocalDescription(new RTCSessionDescription(offer));
					socket.emit('call-user', {
						offer, to: user.id
					});
				});
				socket.on('leave-video', async (user) => {
					setRemoteUsers({ delete: user.id });
					inCall.current[user.id] = false;
					if (peerConnections.current[user.id]) {
						peerConnections.current[user.id].close();
						delete peerConnections.current[user.id];
						delete videoRefs.current[user.id];
					}
				});
			},
			error => {
				console.warn(error);
			}
		);

		socket.on("call-made", async data => {
			const user = data.socket;
			var connection = peerConnections.current[user.id];
			if (!connection) {
				setRemoteUsers({ add: user.id });
				connection = new RTCPeerConnection();
				connection.ontrack = ({ streams: [stream] }) => {
					videoRefs.current[user.id].srcObject = stream;
				};
				localStream.current.getTracks().forEach(track => connection.addTrack(track, localStream.current));

				peerConnections.current[user.id] = connection;
			}
			await connection.setRemoteDescription(
				new RTCSessionDescription(data.offer)
			);
			const answer = await connection.createAnswer();
			await connection.setLocalDescription(new RTCSessionDescription(answer));

			socket.emit("make-answer", {
				answer,
				to: user.id
			});
		});
		socket.on("answer-made", async data => {
			const connection = peerConnections.current[data.socket];
			await connection.setRemoteDescription(
				new RTCSessionDescription(data.answer)
			);
			if (!inCall.current[data.socket]) {
				inCall.current[data.socket] = true;
				const offer = await connection.createOffer();
				await connection.setLocalDescription(new RTCSessionDescription(offer));
				socket.emit('call-user', {
					offer, to: data.socket
				});
			}
		})
		return () => {
			Object.values(peerConnections.current).forEach(c => c.close());
		};
	}, [socket]);

	const joinVideo = () => {
		setInVideo(true);
		inVideoR.current = true;
		socket.emit('join-video');
	};
	const leaveVideo = () => {
		setInVideo(false);
		inVideoR.current = false;
		socket.emit('leave-video');
		setRemoteUsers({ clear: true });
		peerConnections.current = {};
		videoRefs.current = {};
		inCall.current = {};
	};
	const classes = useStyles();

	return (
		<div>
			{Object.keys(remoteUsers).map(user => (
				<video autoPlay key={user} ref={el => videoRefs.current[user] = el} />
			))}
			<Portal container={selfVideoContainer.current}>
				<Box display="flex" className={classes.selfVideo} >
					<video autoPlay ref={localVideoEl} />
					<Button
						disabled={!canJoinVideo}
						variant="contained"
						color="primary"
						onClick={inVideo ? leaveVideo : joinVideo}
					>
						{inVideo ? "Leave Video" : "Join Video"}
					</Button>
				</Box>
			</Portal>
		</div>
	);
}
const useStyles = makeStyles(() => ({
	selfVideo: {
		height: '100%',
		'& video': {
			maxHeight: '100%',
			height: 240
		}
	}
}));