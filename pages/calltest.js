import { Box, Button } from '@material-ui/core';
import io from 'socket.io-client';

export default function Index() {
	const localVideoEl = React.useRef();
	const remoteVideoEl = React.useRef();

	const peerConnection = React.useRef(null);
	const inCall = React.useRef(false);
	const socket = React.useRef(null);
	const [users, setUsers] = React.useState([]);

	React.useEffect(() => {
		socket.current = io();
		socket.current.on("update-user-list", ({ users }) => {
			setUsers(users)
		});
		socket.current.on("call-made", async data => {
			await peerConnection.current.setRemoteDescription(
				new RTCSessionDescription(data.offer)
			);
			const answer = await peerConnection.current.createAnswer();
			await peerConnection.current.setLocalDescription(new RTCSessionDescription(answer));

			socket.current.emit("make-answer", {
				answer,
				to: data.socket
			});
		});
		socket.current.on("answer-made", async data => {
			await peerConnection.current.setRemoteDescription(
				new RTCSessionDescription(data.answer)
			);

			if (!inCall.current) {
				inCall.current = true;
				startStreaming(data.socket);
			}
		});
		return () => socket.current.disconnect();
	}, []);

	console.log("Users", users);

	React.useEffect(() => {
		peerConnection.current = new RTCPeerConnection();
		peerConnection.current.ontrack = ({streams: [stream]}) => {
			remoteVideoEl.current.srcObject = stream;
		}
		navigator.getUserMedia(
			{ video: { width: 240, height: 240 } },
			stream => {
				localVideoEl.current.srcObject = stream;
				stream.getTracks().forEach(track => peerConnection.current.addTrack(track, stream));
			},
			error => {
				console.warn(error);
			}
		);
		return () => peerConnection.current.close();
	}, []);

	async function startStreaming(user) {
		const offer = await peerConnection.current.createOffer();
		await peerConnection.current.setLocalDescription(new RTCSessionDescription(offer));

		socket.current.emit("call-user", {
			offer,
			to: user
		});
	}

	return (
		<Box>
			<video autoPlay ref={localVideoEl} />
			<video autoPlay ref={remoteVideoEl} />
			<br />
			My ID: {socket.current && socket.current.id}
			<br />
			<br />
			<br />
			Connect to: 
			{users.map(user => (
				<Button color="primary" disabled={user === socket.current.id} key={user} onClick={() => startStreaming(user)} variant="contained">
					{user}
				</Button>
			))}
		</Box>
	);
}