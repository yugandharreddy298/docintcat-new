'use strict';

const path = require('path')
/**
 * @api {get} /apple-app-site-association  
 * @apiName index
 * @apiGroup ios
 * @apiSuccess send file
 */
// Get list of versions
exports.index = function(req, res) {
  const aasa = path.join(__dirname, 'apple-app-site-association')
  console.log(aasa)

  res.set('Content-Type', 'application/json')
  res.status(200)
  res.sendFile(aasa)
};
