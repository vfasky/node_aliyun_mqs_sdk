"use strict";
var _ = require('lodash');
var xml = require('./xml');

var Queue = function(client){
  this.client = client;
};


Queue.prototype.create = function(name, option, callback) {
  var self = this;
  var uri  = '/' + name;

  option = _.extend({
    DelaySeconds: 0,
    MessageRetentionPeriod: 345600,
    VisibilityTimeout: 30,
    MaximumMessageSize: 65536,
    PollingWaitSeconds: 0
  }, option || {});

  this.client.send('PUT', {}, xml.build(option, 'Queue'), uri, function(error, response, xml){
    var err = error || self.client.getError(xml);
    if(err){
      return callback({
        code: err.code || error,
        message: err.message || error
      });
    }

    callback(null, response.headers.location);
  });
};

Queue.prototype.setAttr = function(name, attr, callback){
  var self = this;
  var uri  = '/' + name + '?metaoverride=true';
  attr = attr || {};

  this.client.send('PUT', {}, xml.build(attr, 'Queue'), uri, function(error, response, xmlStr){
    var err = error || self.client.getError(xmlStr);
    if(err){
      return callback({
        code: err.code || error,
        message: err.message || error
      });
    }

    callback(null);
  });
};

Queue.prototype.getAttr = function(name, callback){
  var self = this;
  var uri  = '/' + name;

  this.client.send('GET', {}, '', uri, function(error, response, xmlStr){
    var err = error || self.client.getError(xmlStr);
    if(err){
      return callback({
        code: err.code || error,
        message: err.message || error
      });
    }
    var keyMap = [
      'QueueName',
      'CreateTime',
      'LastModifyTime',
      'DelaySeconds',
      'MaximumMessageSize',
      'MessageRetentionPeriod',
      'PollingWaitSeconds',
      'Activemessages',
      'InactiveMessages',
      'DelayMessages'
    ];
    var data = {};
    _.each(keyMap, function(v){
      var tag = xml.getOneTag(xmlStr, v);
      if(tag !== null){
        data[v] = tag;
      }
    });

    callback(null, data);
  });
};

Queue.prototype.remove = function(name, callback){
  var self = this;
  var uri  = '/' + name;

  this.client.send('DELETE', {}, '', uri, function(error, response, xmlStr){
    var err = error || self.client.getError(xmlStr);
    if(err){
      return callback({
        code: err.code || error,
        message: err.message || error
      });
    }
    callback(err);
  });
};

Queue.prototype.list = function(skip, limit, findPre, callback){
  var self = this;
  var uri  = '/';

  var headers = {
    'x-mqs-ret-number': String(limit || 1000),
  };
  if(findPre){
    headers['x-mqs-prefix'] = findPre;
  }
  if(skip){
    headers['x-mqs-marker'] = skip;
  }

  this.client.send('GET', headers, '', uri, function(error, response, xmlStr){
    var err = error || self.client.getError(xmlStr);
    if(err){
      return callback({
        code: err.code || error,
        message: err.message || error
      });
    }
    var queue = xml.getTag(xmlStr, 'Queue');
    var list  = [];
    _.each(queue, function(v){
      var url = xml.getOneTag(v, 'QueueURL');
      list.push({
        url: url,
        name: url.split('/').pop()
      });
    });

    callback(err, {
      list: list,
      nextMarker: xml.getOneTag(xmlStr, 'NextMarker')
    });
  });
};

module.exports = Queue;