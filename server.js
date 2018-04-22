(function() {
  const net = require('net');

  const dataPages = require('./data.js');

  const port = 8080;

  const server = net.createServer(client => {
    client.setEncoding('utf8');

    client.on('data', data => {
      let request = {};

      let requestSplit = data.split('\r\n\r\n');

      let requestHeader = requestSplit[0];
      let requestBody = requestSplit[1];

      request.header = parseHeader(requestHeader);
      request.body = requestBody;

      let uri = parseURI(request.header.requestline.URI);
      console.log(uri);

      if (dataPages.hasOwnProperty(uri.uri) && uri.file !== '404.html') {
        client.write(
          buildResponse(
            dataPages[uri.uri],
            200,
            uri.type,
            request.header.requestline.method
          )
        );
      } else {
        client.write(
          buildResponse(
            dataPages['404.html'],
            404,
            uri.type,
            request.header.requestline.method
          )
        );
      }
    });
    client.on('end', (...args) => {});
    client.on('close', (...args) => {
      console.log('Client disconnected');
    });
  });
  server.on('error', error => {
    throw error;
  });
  server.listen(port, () => {});

  let responseCodes = { 200: 'OK', 404: 'Not Found' };

  function buildResponse(body, responseCode, type, method) {
    let responseMessage = responseCodes[responseCode];
    if (!responseMessage) {
      responseMessage = 'Not Found';
    }
    let responseLine = `HTTP/1.1 ${responseCode} ${responseMessage}\r\n`;
    let dateLine = `Date: ${new Date().toUTCString()}\r\n`;
    let contentType = `Content-Type: text/${type}; charset=utf-8\r\n`;
    let contentLength = `Content-Length: ${body.length}\r\n`;
    let headerBreak = `\r\n`;

    if (method === 'HEAD') {
      return (
        responseLine + dateLine + contentType + contentLength + headerBreak
      );
    } else {
      return (
        responseLine +
        dateLine +
        contentType +
        contentLength +
        headerBreak +
        body
      );
    }
  }

  function parseHeader(header) {
    let result = header.split('\r\n').reduce(function(acum, curr, index) {
      if (index === 0) {
        let requestLine = curr.split(' ');
        acum['requestline'] = {
          method: requestLine[0],
          URI: requestLine[1],
          version: requestLine[2]
        };
      } else {
        let headerLine = curr.split(': ');
        acum[headerLine[0]] = headerLine[1];
      }
      return acum;
    }, {});
    return result;
  }
  // function parseBody(body) {}

  function parseURI(uri) {
    let index = uri.lastIndexOf('/');
    let file = index !== -1 ? uri.slice(index + 1, uri.length) : uri;

    index = uri.lastIndexOf('.');
    let fileType = index !== -1 ? uri.slice(index + 1, uri.length) : 'html';
    return {
      uri: uri,
      file: file,
      type: fileType
    };
  }
})();
