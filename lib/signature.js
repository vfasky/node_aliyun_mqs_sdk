"use strict";

var base64 = require('./base64');
var crypto = require('crypto');

module.exports = function(key, method, headers, resource){
  var contentMd5 = headers['content-md5'] || '';
  var contentType = headers['content-type'] || '';
  var date = headers['date'];
  var mqsHeaders = [];
  for(var k in headers){
    if(k.indexOf('x-mqs-') === 0){
      mqsHeaders.push(k + ':' + String(headers[k]).trim());
    }
  }
  mqsHeaders.sort();

  var stringToSign = method + '\n' +
                     contentMd5 + '\n' +
                     contentType + '\n' +
                     date + '\n' +
                     mqsHeaders.join('\n') + '\n' +
                     resource;

  var sha1 = crypto.createHmac('sha1', key); 
  sha1.update(stringToSign);
  var sha1Hmac = sha1.digest();
  return base64.encode(sha1Hmac);   
};