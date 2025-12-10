import http from 'http';
import httpProxy from 'http-proxy';

const NOTIFICATION_SERVICE_URL = 'http://notification-service:8083'; // Your notification-service address
const PROXY_PORT = 9002; // A new port for this proxy

const proxy = httpProxy.createProxyServer({
  target: process.env.NOTIFICATION_SERVICE_URL || 'http://notification-service:8083',
  ws: true, // Enable WebSocket proxying
});

const server = http.createServer((req, res) => {
  // Handle CORS for SockJS HTTP handshake
  res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3000');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }
  proxy.web(req, res, { target: NOTIFICATION_SERVICE_URL });
});

server.on('upgrade', (req, socket, head) => {
  console.log('Proxying WebSocket upgrade for notifications:', req.url);
  proxy.ws(req, socket, head);
});

proxy.on('error', (err, req, res) => {
  console.error('Notification Proxy Error:', err);
  if (res && !res.headersSent) {
    res.writeHead(500, { 'Content-Type': 'text/plain' }).end('Proxy error.');
  }
});

server.listen(PROXY_PORT, () => {
  console.log(`✅ Notification WebSocket proxy running on http://localhost:${PROXY_PORT}`);
});