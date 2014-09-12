"use strict";

var _ = require('lodash');

exports.getTag = function(xml, tag){
  if(xml.indexOf('<' + tag + '>') === -1){
      return [];
  }
  var data = [];
  var tree = xml.split('<' + tag + '>');
  _.each(tree, function(v){
    if(v.indexOf('</' + tag + '>') !== -1){
      var item = (v.split('</' + tag + '>')[0]).trim();
      if(item.length > 0){
        data.push(item);
      }
    }
  });
  return data;
};

exports.getOneTag = function(xml, tag){
  var data = exports.getTag(xml, tag);
  if(data.length === 0){
    return null;
  }
  return data[0];
};

exports.build = function(data, root){
  var items = [];
  items.push('<?xml version="1.0" encoding="utf-8"?>');
  items.push('<'+ root +' xmlns="http://mqs.aliyuncs.com/doc/v1/">');
  for(var key in data){
    if(data[key].length > 0){
      items.push('<' + key + '>' + data[key] + '</' + key + '>');
    }
  }
  
  items.push('</'+ root +'>');

  return items.join('');
};