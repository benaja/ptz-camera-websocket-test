import WebSocket from "ws";

function setupWebsocket(url) {
  let websocket = null;
  let isConnected = false;
  let lastPollReceived = null;
  let pingInterval = null;
  let lastPingSent = null;
  let lastPingMs = null;

  // Define onClose function BEFORE using it
  const onClose = () => {
    clearInterval(pingInterval);
    websocket = null;
    isConnected = false;
    lastPollReceived = null;
    lastPingSent = null;
    lastPingMs = null;
  };

  console.log("setting up websocket: ", url);

  // create websocket connection
  websocket = new WebSocket(url);

  // This is called when the websocket connection is established
  websocket.on("open", () => {
    console.log("websocket connected: ", url);
    isConnected = true;

    // This sets up an interval, means this function will be called every 5 seconds
    // sends a ping to the server every 5 seconds
    pingInterval = setInterval(() => {
      if (lastPollReceived && Date.now() - lastPollReceived > 11000) {
        console.log("no pong received in 11 seconds");
        onClose();
      }
      if (!websocket) {
        console.error("cannot ping, no websocket");
        return;
      }
      console.log("pinging");
      try {
        lastPingSent = Date.now();
        // send a ping to the server
        websocket.ping();
      } catch (error) {
        console.log("error pinging", error);
        console.error("error pinging", error);
      }
    }, 5000);
  });

  // This is called when the websocket connection is closed
  websocket.on("close", (e, reason) => {
    console.log("websocket closed", e, reason);
    onClose();
  });

  //   connection encounters an error
  websocket.on("error", (error) => {
    isConnected = false;
    console.error("websocket error", error, url);
  });

  // This is called when a pong is received from the server
  websocket.on("pong", () => {
    lastPollReceived = Date.now();
    if (lastPingSent) {
      lastPingMs = lastPollReceived - lastPingSent;
    }

    console.log("pong received after", lastPingMs, "ms");
  });
}

// call the websocket setup function to start the websocket connection
setupWebsocket("ws://127.0.0.1:3004");
