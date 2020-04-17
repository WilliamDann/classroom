import json

class Client(dict):
    def __init__(self, userID, username, websocket, isBroadcaster=False):
        # for json.dumps
        dict.__init__(self, userID = userID, username = username, isBroadcaster = isBroadcaster, frame=None)

        # not seralized
        self.websocket = websocket
    
    # update the user's video
    def updateFrame(self, frame):
        self.frame = frame

class ClientEncoder(json.JSONEncoder):
    def default(self, o):
        return o.__dict__    
