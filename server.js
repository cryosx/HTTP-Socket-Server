const net = require('net');

const dataPages = require('./data.js');

const port = 8080;

let header = null;

const server = net.createServer(client => {
  // console.log('client connected');

  client.setEncoding('utf8');
  client.on('data', data => {
    let request = data.split('\r\n');

    let requestHeader = request.slice(0, request.length - 2);
    let requestBody = request.slice(request.length - 1);

    // let requestLine = request[0].split(' ');
    // console.log(requestHeader);
    header = requestHeader.reduce(function(acum, curr, index) {
      if (index === 0) {
        let requestLine = curr.split(' ');
        acum['request'] = {
          method: requestLine[0],
          URI: requestLine[1],
          version: requestLine[2]
        };
        return acum;
      } else {
        let headerLine = curr.split(': ');
        // console.log('headerline', headerLine);
        acum[headerLine[0]] = headerLine[1];

        return acum;
      }
    }, {});

    if (header.request.method === 'GET') {
      if (header.request.URI === '/' || header.request.URI === '/index.html') {
        // console.log(buildReponse(dataPages['index.html']));
        client.write(buildReponse(dataPages['index.html']));
      } else if (header.request.URI === '/hydrogen.html') {
        client.write(buildReponse(dataPages['hydrogen.html']));
      } else if (header.request.URI === '/helium.html') {
        client.write(buildReponse(dataPages['helium.html']));
      } else if (header.request.URI === '/css/styles.css') {
        client.write(buildReponse(dataPages['styles.html']));
      } else {
        client.write(buildReponse(dataPages['404.html']));
      }
    }

    // console.log(header);
  });
  client.on('end', (...args) => {
    // console.log('end', request);
    // console.log('end', ...args);
  });
  client.on('close', (...args) => {
    // console.log('close', request);
    // console.log('close', ...args);
  });
});
server.on('error', error => {
  throw error;
});
server.listen(port, () => {
  // console.log('server bound');
});

function buildReponse(body) {
  let responseLine = `HTTP/1.1 200 OK\r\n`;
  let date = `Date: ${new Date().toUTCString()}\r\n`;
  let contentType = `Content-Type: text/html; charset=utf-8\r\n`;
  let contentLength = `Content-Length: ${body.length}\r\n`;
  let headerBreak = `\r\n`;

  return responseLine + date + contentType + contentLength + headerBreak + body;
}
