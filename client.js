const net = require('net');
const url = require('url');
const { URL } = require('url');

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

// const protocols = { 'http:': 80, 'https:': 443 };
const ports = { 'http:': 80, 'https:': 443 };

// let serverUrl = new URL(process.argv[2]);

let serverUrl = new URL(validateUrl(process.argv[2]));

let method = validateMethod(process.argv[3]);

// let responseString = '';
let response = {};
let chunks = [];

console.log(serverUrl);
let options = {
  host: serverUrl.host,
  port: ports[serverUrl.protocol]
};

const server = net.createConnection(options, (...args) => {
  console.log('connected to server!');

  server.setEncoding('utf8');
  server.write(
    buildRequestHeader(method, serverUrl.pathname, serverUrl.hostname)
  );

  server.on('data', data => {
    // responseString += data;
    chunks.push(data);
    console.log(data);
    server.end();
  });

  server.on('end', () => {
    console.log(chunks);
    let responseString = chunks.join('');
    console.log(responseString);

    let responseLine = responseString.split('\r\n');
    // console.log(responseLine);
    let responseHeader = responseLine.slice(0, responseLine.length - 2);
    let responseBody = responseLine.slice(responseLine.length - 1);
    responseBody = responseLine[responseLine.length - 4];
    // console.log(responseLine[responseLine.length - 4]);

    // let responseLine = responseLine[0].split(' ');
    // console.log(responseHeader);
    response[url.host] = responseHeader.reduce(function(acum, curr, index) {
      if (index === 0) {
        acum.header = {};
        let responseLine = curr.split(' ');
        acum.header.responseLine = {
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
    response[url.host]['body'] = responseBody;
    // console.log(response[url.host]);
    // console.log(response[url.host].body);
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
  console.log(requestLine + hostLine + dateLine + breakLine);
  return requestLine + hostLine + dateLine + breakLine;
}

function validateUrl(url) {
  try {
    url = new URL(url);
  } catch (error) {
    url = new URL(`http://${url}`);
  }
  return url;
}

// function setUrl(url) {
//   try {
//     url = new URL(url);
//   } catch (error) {
//     url = new URL(`http://${url}`);
//   }
//   return url;
// }

// function parseUrl(url) {
//   let host = null;
//   let protocol = null;
//   let uri = null;
//   let port = null;

//   if (url.startsWith('https')) {
//     port = 443;
//   } else {
//     port = 80;
//   }

//   if (url.indexOf('://') !== -1) {
//     let urlSplit = url.split('://');
//     protocol = urlSplit[0];
//     url = urlSplit[1];
//   } else {
//     protocol = 'http';
//   }

//   if (url.indexOf('/') !== -1) {
//     host = url.slice(0, url.indexOf('/'));
//     uri = url.slice(url.indexOf('/'));
//   } else {
//     host = url;
//     uri = '/';
//   }

//   return {
//     host: `${host}`,
//     uri: uri,
//     port: port
//   };
// }
