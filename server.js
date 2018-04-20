const net = require('net');

const port = 8080;

const server = net.createServer(client => {
  // console.log('client connected');
  client.on('data', data => {
    data.setEncoding('utf8');
  });

  client.on('end', () => {
    // console.log('client disconnected');
  });

  client.write('hello\r\n');
  // client.pipe(client);
});
server.on('error', error => {
  throw error;
});
server.listen(port, () => {
  // console.log('server bound');
});
