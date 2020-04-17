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
            if user["userID"] == uid:
                return user
        return -1

    # unregister a user
    async def unregister(self, websocket):
        for user in self.connectedClients:
            if user.websocket == websocket:
                self.connectedClients.remove(user)
                return user
                
        return -1 # did not find user

    # register a user
    async def register(self, websocket):
        try:
            await websocket.send("userdata") # request user for their information
            userData = json.loads(await websocket.recv())
            uid = self.generateID()

            # create user
            client = Client(uid, userData["username"], websocket, userData["isBroadcaster"])
            self.connectedClients.append(client)

            await websocket.send("set userID")
            await websocket.send(uid)

            return client
        except Exception as e:
            await websocket.send("Error: incorrect format")

    # streaming websocket server
    async def ingest(self, websocket, path):
        bad_frames = 0
        try:
            while True:
                data = json.loads(await websocket.recv())
                user = self.getUserByID(data["userID"])

                if (user == -1):
                    await websocket.send("Error: userID does not exist")
                    break

                user["frame"] = data["frame"]
                await asyncio.sleep(0.01)
        except websockets.ConnectionClosed as e:
            raise e
        except Exception as e:
            bad_frames += 1
            await websocket.send("Error: bad frame data")

    # viewer websocket server
    async def run(self, websocket, path):
        client = await self.register(websocket)

        try:
            while True:
                # send data
                await websocket.send(json.dumps(self.connectedClients))
                await asyncio.sleep(0.01) # todo maybe change fps?
        except websockets.ConnectionClosed as e:
            pass
        finally:
            await self.unregister(websocket)