const net = require('net');

const arguments = process.argv.slice(2);

const methods = [
  'GET',
  'HEAD',
  'POST',
  'PUT',
  'DELETE',
  'CONNECT',
  'OPTIONS',
  'TRACE',
  'PATCH'
];

const protocols = { 'http:': 80, 'https:': 443 };

let url = process.argv[2];
url = new URL(process.argv[2]);

url = parseUrl(url);
try {
  url = new URL(process.argv[2]);
} catch (error) {
  url = new URL(`http://${process.argv[2]}`);
}
let method = process.argv[3];
// if () {

// }
method = validateMethod(method);

let responseString = '';
let responses = {};
let chunks = [];

let options = {
  host: url.host,
  port: url.port
};

const server = net.createConnection(options, (...args) => {
  //'connect' listener
  server.setEncoding('utf8');
  console.log(...args);
  console.log('connected to server!');
  server.write(buildRequestHeader(method, url.uri, url.host));

  server.on('data', data => {
    responseString += data;
    chunks.push(data);
    // console.log(data);
    // console.log(responseString);
    server.end();
  });

  server.on('end', () => {
    console.log(chunks);
    console.log(chunks.length);
    // console.log(responseString);
    let response = responseString.split('\r\n');
    // console.log(response);
    let responseHeader = response.slice(0, response.length - 2);
    let responseBody = response.slice(response.length - 1);
    responseBody = response[response.length - 4];
    // console.log(response[response.length - 4]);

    // let responseLine = response[0].split(' ');
    // console.log(responseHeader);
    responses[url.host] = responseHeader.reduce(function(acum, curr, index) {
      if (index === 0) {
        acum.header = {};
        let responseLine = curr.split(' ');
        acum.header.response = {
          method: responseLine[0],
          URI: responseLine[1],
          version: responseLine[2]
        };
        return acum;
      } else {
        let headerLine = curr.split(': ');
        acum.header[headerLine[0]] = headerLine[1];
        return acum;
      }
    }, {});
    responses[url.host]['body'] = responseBody;
    // console.log(responses[url.host]);
    // console.log(responses[url.host].body);
    console.log('disconnected from server');
  });
  server.on('close', (...args) => {
    // console.log(...args);
  });
});

server.on('error', error => {
  console.log(error);
});

function validateMethod(method) {
  if (method && methods.includes(method.toUpperCase())) {
    return method.toUpperCase();
  } else {
    return 'GET';
  }
}

function buildRequestHeader(method, uri, host) {
  let requestLine = `${method} ${uri} HTTP/1.1\r\n`;
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
