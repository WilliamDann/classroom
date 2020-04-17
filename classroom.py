from client import Client
import websockets
import asyncio
import json
import random
import string

# classroom server
class Classroom:
    # list of currently connected clients
    connectedClients: list = None

    # network options
    host: string = None
    port: int    = None

    def __init__(self, host, port):
        self.host = host
        self.port = port

        self.connectedClients = []

        self.viewSocket   = websockets.serve(self.run, host, port)
        self.streamSocket = websockets.serve(self.ingest, host, port+1)

    # start the websocket servers
    def start(self):
        asyncio.get_event_loop().run_until_complete(self.viewSocket)
        asyncio.get_event_loop().run_until_complete(self.streamSocket)

        asyncio.get_event_loop().run_forever()

    # generate a userid
    def generateID(self):
        return ''.join([random.choice(string.ascii_letters + string.digits) for n in range(32)]) 

    # get a user by their id
    def getUserByID(self, uid):
        for user in self.connectedClients:
            if user.userID == uid:
                return user
        return -1

    # unregister a user
    async def unregster(self, websocket, path):
        for user in self.connectedClients:
            if user.websocket == websocket:
                self.connectedClients.remove(user)
                return user
                
        return -1 # did not find user

    # register a user
    async def register(self, websocket, path):
        try:
            await websocket.send("userdata") # request user for their information
            userData = json.loads(await websocket.recv())
            uid = self.generateID()

            # create user
            self.connectedClients.append(Client(uid, userData.name, websocket, userData.isBroadcaster))

            await websocket.send("set userID")
            await websocket.send(uid)

        except:
            await websocket.send("Error: incorrect format")

    # streaming websocket server
    async def ingest(self, websocket, path):
        bad_frames = 0
        while True:
            try:
                data = json.loads(await websocket.recv())
                user = self.getUserByID(data.userID)

                if (user == -1):
                    await websocket.send("Error: userID does not exist")
                    break

                user.frame = data.frame
                await asyncio.sleep(0.01)
            except websockets.ConnectionClosed as e:
                break
            except Exception as e:
                bad_frames += 1

                await websocket.send("Error: bad frame data")
                if (bad_frames >= 500):
                    break
                continue

    # viewer websocket server
    async def run(self, websocket, path):
        self.register(websocket, path)

        while True:
            try:
                # send data
                await websocket.send(json.dumps(self.connectedClients))
                await asyncio.sleep(0.1) # todo maybe change fps?
            finally:
                self.connectedClients.remove(websocket)