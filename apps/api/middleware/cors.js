'use strict';

// CORS configuration (mostly default for now).
module.exports = function allowCrossOrigin () {
  return function (req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'HEAD,OPTIONS,GET,PUT,PATCH,POST,DELETE');
    res.header('Access-Control-Allow-Headers', 'X-Requested-With,Content-Type,Content-Length');
    next();
  };
};
