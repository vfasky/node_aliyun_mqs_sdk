"use strict";
var _ = require('lodash');
var xml = require('./xml');
var Promise = require('mpromise');
var undef;

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

  var promise;
  if(undef === callback){
    promise = new Promise();
    callback = function(err, data){
      if(err){
        promise.reject(err.message);
      }
      else{
        promise.resolve(null, data);
      }
    };
  }

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

  return promise;
};

Queue.prototype.setAttr = function(name, attr, callback){
  var self = this;
  var uri  = '/' + name + '?metaoverride=true';
  attr = attr || {};

  var promise;
  if(undef === callback){
    promise = new Promise();
    callback = function(err, data){
      if(err){
        promise.reject(err.message);
      }
      else{
        promise.resolve(null, data);
      }
    };
  }


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

  return promise;
};

Queue.prototype.getAttr = function(name, callback){
  var self = this;
  var uri  = '/' + name;

  var promise;
  if(undef === callback){
    promise = new Promise();
    callback = function(err, data){
      if(err){
        promise.reject(err.message);
      }
      else{
        promise.resolve(null, data);
      }
    };
  }


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

  return promise;
};

Queue.prototype.remove = function(name, callback){
  var self = this;
  var uri  = '/' + name;

  var promise;
  if(undef === callback){
    promise = new Promise();
    callback = function(err, data){
      if(err){
        promise.reject(err.message);
      }
      else{
        promise.resolve(null, data);
      }
    };
  }

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

  return promise;
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

  var promise;
  if(undef === callback){
    promise = new Promise();
    callback = function(err, data){
      if(err){
        promise.reject(err.message);
      }
      else{
        promise.resolve(null, data);
      }
    };
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

  return promise;
};

module.exports = Queue;