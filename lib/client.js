"use strict";

var _ = require('lodash');
var signature = require('./signature');
var base64 = require('./base64');
var Queue = require('./queue');
var Message = require('./message');
var xml = require('./xml');
var request = require('request');
var crypto = require('crypto');

var MQSClient = function(option){
  this.option = _.extend({
    accessKeyId: null,
    accessKeySecret: null,
    url: null,
  }, option || {});

  this.version = '2014-07-08';
  this.contentType = 'text/xml;charset=UTF-8';

  this.queue = new Queue(this);
  this.message = new Message(this);
};

MQSClient.prototype.authorization = function(method, headers, uri){
  return 'MQS ' + 
         this.option.accessKeyId + 
         ":" + 
         this.signature(this.option.accessKeySecret, method, headers, uri);
};

MQSClient.prototype.send = function(method, headers, xml, uri, callback){
  var md5 = crypto.createHash('md5');
  md5.update(xml);
 
  headers = _.extend({
    'x-mqs-version': this.version,
    'content-type': this.contentType,
    'content-md5': base64.encode(md5.digest('hex')),
    date: (new Date()).toGMTString()
  }, headers || {});

  headers.Authorization = this.authorization(method, headers, uri);

  request({
    url: this.option.url + uri,
    method : method,
    headers: headers,
    body : xml
  }, callback);
};

MQSClient.prototype.getError = function(xmlStr){
  var error = null;
  var code = xml.getOneTag(xmlStr, 'Code');
  if(code === null){
    return null;
  }
  return {
    code: code,
    message: xml.getOneTag(xmlStr, 'Message')
  };

};


MQSClient.prototype.signature = signature;

module.exports = MQSClient;