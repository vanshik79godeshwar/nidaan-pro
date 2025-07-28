// frontend/proxy-server.mjs
import http from 'http';
import httpProxy from 'http-proxy';

const CHAT_SERVICE_URL = 'http://localhost:8084'; // Your chat-service address
const PROXY_PORT = 9001;

const proxy = httpProxy.createProxyServer({
  target: CHAT_SERVICE_URL,
  ws: true, // Enable WebSocket proxying
});

const server = http.createServer((req, res) => {
  // This server will now handle the initial SockJS HTTP handshake and CORS.
  // We add the necessary CORS headers to every HTTP response.
  res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3000');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');

  // For the OPTIONS pre-flight request, we can just send a 200 OK.
  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  // For all other HTTP requests (like the /info GET request),
  // we proxy them to the chat service.
  proxy.web(req, res, { target: CHAT_SERVICE_URL });
});

// This handles the WebSocket "Upgrade" request.
server.on('upgrade', (req, socket, head) => {
  console.log('Proxying WebSocket upgrade request for:', req.url);
  proxy.ws(req, socket, head);
});

// Error handling
proxy.on('error', (err, req, res) => {
  console.error('Proxy error:', err);
  if (res && !res.headersSent) {
    res.writeHead(500, { 'Content-Type': 'text/plain' });
    res.end('Proxy error.');
  }
});


server.listen(PROXY_PORT, () => {
  console.log(`✅ WebSocket proxy is running on http://localhost:${PROXY_PORT}`);
  console.log(`-> Forwarding traffic to chat-service at ${CHAT_SERVICE_URL}`);
});