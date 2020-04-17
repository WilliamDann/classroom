var server = new WebSocket("ws://localhost:8080");
var stream = new WebSocket("ws://localhost:8081");

const display = document.querySelector('#serverdata');
const video = document.querySelector('#video');

var userid = null;

// get webcam access
navigator.mediaDevices.getUserMedia({video: {width: 360, height: 360}}).then((stream) => video.srcObject = stream);

function getFrame() {
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext('2d').drawImage(video, 0, 0);
    const data = canvas.toDataURL('image/jpeg');

    return data;
}

// send data
server.onopen = () => {
    console.log("connected to call.");
}

var next = false
server.onmessage = message => {
    
    if (next == 'uid') {
        if (!userid) {
            userid = message.data;
            next = false;

            // start streaming
            setInterval(() => {
                stream.send( JSON.stringify({ userID: userid, frame: getFrame() }) );
            }, 100) // todo fps?
        } else {
            userid = message.data;
            next = false;
        }
    }

    if (message.data == 'userdata') {
        // todo get userdata from user
        server.send(JSON.stringify({ username: "TestUser", isBroadcaster: false }));
    }

    if (message.data == "set userID") {
        next = 'uid';
    }

    display.src = JSON.parse(message.data)[0].frame;
}
