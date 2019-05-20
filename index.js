/*
  Primary file for the API
*/

//Dependencies

const http = require('http');
const https = require('https');
const url = require('url');
const {
  StringDecoder
} = require('string_decoder');
const fs = require('fs');
const config = require('./config');
const _data = require('./lib/data');
const handlers = require('./lib/handlers');
const helpers = require('./lib/helpers');

/*
  Instantiate http server
*/
const httpServer = http.createServer((req, res) => {
  unifiedServer(req,res);
});

httpServer.listen(config.httpPort, () => {
  console.log("Server is listening on port ",config.httpPort)
});

// https server options
const httpsServerOption = {
  'key'  : fs.readFileSync('./https/key.pem'),
  'cert' : fs.readFileSync('./https/cert.pem')
};

// Instantiate the https Server
const httpsServer = https.createServer(httpsServerOption,(req, res) => {
  unifiedServer(req,res);
});

httpsServer.listen(config.httpsPort, () => {
  console.log("Server is listening on port ",config.httpsPort)
});

// All the server logic for both http and https;
const unifiedServer = function(req,res) {
  const parsedUrl = url.parse(req.url, true);
  const pathName = parsedUrl.pathname;
  const trimmedPath = pathName.replace(/^\/+|\/+$/g, '');

  // Get the query string as an object
  const queryStringObj = parsedUrl.query;

  // Get the HttpMethod
  const method = req.method.toLowerCase();

  // Get the headers as an object
  const headers = req.headers;

  // Get the payload
  const decoder = new StringDecoder('utf-8');

  let buffer = '';

  req.on('data', (data) => {
    buffer += decoder.write(data);
  });

  req.on('end', () => {
    buffer += decoder.end();

    // choose the handler  this request should go to , if not found go to notFound handler
    let chosenHandler = typeof(router[trimmedPath]) !== 'undefined' ? router[trimmedPath] : handlers.notFound;

    // Construct the data object to send the handler;
    let data = {
      'trimmedPath': trimmedPath,
      'queryStringObj': queryStringObj,
      'method': method,
      'payload': helpers.parseJsonToObject(buffer)
    };

    // Route the request specified in the router;
    chosenHandler(data, function(statusCode, payload) {
      // Use the status code calledback by the handler or default to 200
      // Use the payload calledback by the handler or default to empty object
      statusCode = typeof(statusCode) === 'number' ? statusCode : 200;
      payload = typeof(payload) === 'object' ? payload : {};

      //convert to the string
      const payloadString = JSON.stringify(payload);

      //Return the response;
      res.setHeader("Content-type",'application/json');
      res.writeHead(statusCode);
      res.end(payloadString);
      console.log("Returning Response -> ", payloadString, ' With statusCode ', statusCode);
    });
  });
}


// Define a request router
const router = {
  'ping':handlers.ping,
  'users':handlers.users
}
