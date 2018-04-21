const net = require('net');

let url = process.argv[2];
url = parseUrl(url);

let responseHeaderStore = {};

let options = {
  host: url.host,
  port: url.port
};

const server = net.createConnection(options, (...args) => {
  //'connect' listener
  console.log(...args);
  console.log('connected to server!');
  server.write(buildRequestHeader('GET', url.uri, url.host));

  server.on('data', data => {
    console.log(data.toString());
    let response = data.split('\r\n');

    let responseHeader = response.slice(0, response.length - 2);
    let responseBody = response.slice(response.length - 1);

    // let responseLine = response[0].split(' ');
    // console.log(responseHeader);
    header = responseHeader.reduce(function(acum, curr, index) {
      if (index === 0) {
        let responseLine = curr.split(' ');
        acum['response'] = {
          method: responseLine[0],
          URI: responseLine[1],
          version: responseLine[2]
        };
        return acum;
      } else {
        let headerLine = curr.split(': ');
        acum[headerLine[0]] = headerLine[1];
        return acum;
      }
    }, {});
    server.end();
  });
  server.on('end', () => {
    console.log('disconnected from server');
  });
});

function buildRequestHeader(method, uri, host) {
  let requestLine = `${method.toUpperCase()} ${uri} HTTP/1.1\r\n`;
  let hostLine = `Host: ${host}\r\n`;
  let dateLine = `Date: ${new Date().toUTCString()}\r\n`;
  let breakLine = '\r\n';
  // console.log(requestLine + hostLine + dateLine + breakLine);
  return requestLine + hostLine + dateLine + breakLine;
}

function parseUrl(url) {
  let host = null;
  let protocol = null;
  let uri = null;
  let port = null;

  if (url.startsWith('https')) {
    port = 443;
  } else {
    port = 80;
  }

  if (url.indexOf('://') !== -1) {
    let urlSplit = url.split('://');
    protocol = urlSplit[0];
    url = urlSplit[1];
  } else {
    protocol = 'http';
  }

  if (url.indexOf('/') !== -1) {
    host = url.slice(0, url.indexOf('/'));
    uri = url.slice(url.indexOf('/'));
  } else {
    host = url;
    uri = '/';
  }

  return {
    host: `${host}`,
    uri: uri,
    port: port
  };
}
