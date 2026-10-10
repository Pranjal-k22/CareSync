const WebSocket = require("ws");

const wss = new WebSocket.Server({
  port: 8080
});

console.log("🔥 WebSocket Server running on port 8080");

wss.on("connection", function connection(ws) {
  console.log("Client Connected");

  ws.on("message", function incoming(message) {
    try {
      const data = JSON.parse(message.toString());

      console.log("Received:", data);

      // Broadcast safely
      wss.clients.forEach(function each(client) {
        if (client !== ws && client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify(data));
        }
      });

    } catch (err) {
      console.log("Invalid JSON");
    }
  });

  ws.on("close", () => {
    console.log("Client Disconnected");
  });

  ws.on("error", (err) => {
    console.log("Socket Error:", err.message);
  });
});