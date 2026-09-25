import http from 'http';
import fs from 'fs';
import { WebSocketServer } from 'ws';

const PORT = 3001;

const server = http.createServer((req, res) => {
  const html = fs.readFileSync('./public/index.html');

  res.writeHead(200, { 'Content-Type': 'text/html' });
  res.end(html);
});

const wss = new WebSocketServer({ server });

wss.on('connection', (socket, req) => {
  const username = new URL(req.url, "http://localhost").searchParams.get(
    "username",
  );

  for (const client of wss.clients) {
    client.send(
      JSON.stringify({
        type: "system",
        text: `${username} joined`,
      }),
    );
  }

  socket.on('message', (data) => {
    const { username, text } = JSON.parse(data.toString());

    for (const client of wss.clients) {
      client.send(
        JSON.stringify({
          type: "chat",
          username,
          text,
        }),
      );
    }
  });

  socket.on('close', () => {
    for (const client of wss.clients) {
      client.send(
        JSON.stringify({
          type: "system",
          text: `${username} left`,
        }),
      );
    }
  });
});

server.listen(PORT, () => {
  console.log(`Chat server running at http://localhost:${PORT}`);
});
