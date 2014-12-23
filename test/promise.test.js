"use strict";

var MQSClient = require('../lib/client');
var config = require('./config');
var assert = require('assert');

var client = new MQSClient(config);

var queue = 'test-node-sdk';

describe('aliyun MQS SDK', function() {
	var receiptHandle;

	it('Create Queue', function(done){
		client.queue.create(queue).then(function(url){
	    	done();
	    }, done);
	});

	it('Get Queue Attr', function(done){
		client.queue.getAttr(queue).then(function(data){
			assert.equal(data.DelaySeconds, '0', 'get queue attr failed');
			done();
		}, done)
	});

	it('Set Queue Attr', function(done){
		client.queue.setAttr(queue, {
	        DelaySeconds: 1
	    }).then(function(){
	    	done();
	    }, done);
	});

	it('Send Message', function(done){
		client.message.send(queue, {
	        msg: 'test'
	    }).then(function(){
	    	done();
	    }, done);
	});

	it('Get Message', function(done){
		client.message.get(queue, 0).then(function(data){
			receiptHandle = data.ReceiptHandle;
			done();
		}, done);
	});

	it('Change Message', function(done){
		client.message.change(queue, receiptHandle, 3).then(function(){
			done();
		}, done);
	});

	it('Remove Message', function(done){
		client.message.remove(queue, receiptHandle).then(function(){
			done();
		}, function(err){
			done(err);
		});
	});

	it('Remove Queue', function(done){
		client.queue.remove(queue).then(function(){
			done();
		}, done)
	});

});