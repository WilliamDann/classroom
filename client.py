class Client:
    isBroadcaster = None
    websocket     = None
    userID        = None
    frame         = None
    username      = None

    def __init__(self, userID, username, websocket, isBroadcaster=False):
        self.userID = userID
        self.username = username
        self.websocket = websocket
        self.isBroadcaster = isBroadcaster
    
    # update the user's video
    def updateFrame(self, frame):
        self.frame = frame