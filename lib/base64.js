"use strict";

exports.encode = function(str){
  return new Buffer(str, 'utf8').toString('base64');
};

exports.decode = function(str){
  return new Buffer(str, 'base64').toString('utf8');
};