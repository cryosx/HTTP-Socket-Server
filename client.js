const net = require('net');
const url = require('url');
const { URL } = require('url');

// const arguments = process.argv[2].split(' ');
const arguments = process.argv.slice(2);

const cliOptions = {
  '-port': 'port',
  '-p': 'port',
  '-method': 'method',
  '-m': 'method'
};

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

const commands = processCli(arguments);

console.log(commands);

const serverUrl = new URL(validateUrl(commands.url));

const method = validateMethod(commands.method || 'GET');

const port = commands.port;

const options = {
  host: serverUrl.hostname,
  port: port || serverUrl.port || ports[serverUrl.protocol] || 80
};

const server = new net.Socket();
server.on('error', error => {
  console.log('error');
});

let timeout = false;

server.setTimeout(3000);

server.on('timeout', error => {
  console.log('Timeout');
  timeout = true;
  server.destroy();
});

server.connect(options, (...args) => {
  let chunks = [];

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
    if (method === 'HEAD') {
      console.log(response.header);
    } else {
      console.log(response.body);
    }
  });
  server.on('close', (...args) => {});
});

function processCli(arguments) {
  let result = {};
  while (arguments.includes('-header')) {
    arguments.splice(arguments.indexOf('-header'), 1);
    result.method = 'HEAD';
  }
  while (arguments.includes('-h')) {
    arguments.splice(arguments.indexOf('-h'), 1);
    result.method = 'HEAD';
  }

  for (let index = 0; index < arguments.length; index++) {
    let elem = arguments[index];
    if (index === 0) {
      result.url = elem;
    } else {
      if (cliOptions.hasOwnProperty(elem)) {
        result[cliOptions[elem]] = arguments[index + 1];
        index++;
      } else {
        console.log(`${elem} is not a valid option, it will be ignored`);
      }
    }
  }
  // arguments.forEach(function(elem, index, array) {
  //   console.log(index);
  //   if (index === 0) {
  //     result.url = elem;
  //   } else {
  //     if (cliOptions.hasOwnProperty(elem)) {
  //       result[cliOptions[elem]] = array[index + 1];
  //       console.log(index);
  //       index = index + 2;
  //       console.log(index);
  //     } else {
  //       console.log(`${elem} is not a valid option, it will be ignored`);
  //     }
  //   }
  // });
  return result;
}

function validateMethod(method) {
  if (method && methods.includes(method.toUpperCase())) {
    return method.toUpperCase();
  } else {
    console.log(`Method ${method} invalid, setting method to GET`);
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
