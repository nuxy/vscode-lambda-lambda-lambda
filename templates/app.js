'use strict';

const Router = require('lambda-lambda-lambda');
const config = require('./config.json');

const accessControlHeaders = require('./middleware/AccessControlHeaders');

/**
 * @see AWS::Serverless::Function
 */
exports.handler = (event, context, callback) => {
  const {request, response} = event.Records[0].cf;

  const router = new Router(request, response);
  router.setPrefix(config.router.prefix);

  // Middleware (order is important).
  router.use(accessControlHeaders);

  // .. everything else.
  router.default(function(req, res) {
    res.status(404).send();
  });

  callback(null, router.response());
};
