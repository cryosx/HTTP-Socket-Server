const net = require('net');
const url = require('url');
const { URL } = require('url');

const arguments = process.argv.slice(2);

const cliOptions = ['-port', '-p', '-header', '-h', '-method', '-m'];

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

const ports = { 'http:': 80, 'https:': 443 };

processCli(arguments);

function processCli(arguments) {}

let serverUrl = new URL(validateUrl(process.argv[2]));

let method = validateMethod(process.argv[3]);

let chunks = [];

let options = {
  host: serverUrl.hostname,
  port: serverUrl.port || ports[serverUrl.protocol] || 80
};

const server = net.createConnection(options, (...args) => {
  console.log('connected');
  server.setEncoding('utf8');

  server.write(
    buildRequestHeader(method, serverUrl.pathname, serverUrl.hostname)
  );

  server.on('data', data => {
    chunks.push(data);
    server.end();
  });

  server.on('end', () => {
    let response = {};

    let responseString = chunks.join('');

    let responseSplit = responseString.split('\r\n\r\n');

    let responseHeader = responseSplit[0];
    response.header = parseHeader(responseHeader);

    let responseBody = responseSplit[1];
    if (
      response.header['Transfer-Encoding'] ||
      response.header['Transfer-Encoding'] === 'chunked'
    ) {
      response.body = parseBody(responseBody, 'chunked');
    } else {
      response.body = parseBody(responseBody, false);
    }
    console.log(response.body);
  });
  server.on('close', (...args) => {});
});

server.on('error', error => {});

function validateMethod(method) {
  if (method && methods.includes(method.toUpperCase())) {
    return method.toUpperCase();
  } else {
    return 'GET';
  }
}

function validateUrl(url) {
  try {
    url = new URL(url);
  } catch (error) {
    url = new URL(`http://${url}`);
  }
  return url;
}

function buildRequestHeader(method, uri, host) {
  let requestLine = `${method} ${uri} HTTP/1.1\r\n`;
  let hostLine = `Host: ${host}\r\n`;
  let dateLine = `Date: ${new Date().toUTCString()}\r\n`;
  let breakLine = '\r\n';
  // console.log(requestLine + hostLine + dateLine + breakLine);
  return requestLine + hostLine + dateLine + breakLine;
}

function parseHeader(header) {
  // let temp = responseHeader.split('\r\n');
  let result = null;

  result = header.split('\r\n').reduce(function(acum, curr, index) {
    if (index === 0) {
      let statusline = curr.split(' ');
      acum.status = {
        version: statusline[0],
        code: statusline[1],
        phrase: statusline[2]
      };
    } else {
      let header = curr.split(': ');
      acum[header[0]] = header[1];
    }
    return acum;
  }, {});

  return result;
}

function parseBody(body, chunked) {
  let result = null;
  if (chunked) {
    result = body.split('\r\n').reduce(function(acum, curr, index) {
      return index % 2 === 1 ? acum + curr : acum;
    }, '');
  } else {
    result = body;
  }
  return result;
}
