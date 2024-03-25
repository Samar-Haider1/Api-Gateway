const http = require('http');
const httpProxy = require('http-proxy');

const proxy = httpProxy.createProxyServer({});
const servers = [
  { target: 'http://localhost:3001' }, // Server 1
  { target: 'http://localhost:3002' }, // Server 2
  // Add more servers as needed
];

const server = http.createServer((req, res) => {
  // Choose a server to forward the request to (simple round-robin in this example)
  const targetServer = servers.shift();
  servers.push(targetServer);

  // Proxy the request to the chosen server
  proxy.web(req, res, targetServer, (err) => {
    console.error(err);
  });
});

server.listen(8000, () => {
  console.log('Load balancer listening on port 8000');
});
``