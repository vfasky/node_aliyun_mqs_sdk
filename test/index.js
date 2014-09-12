"use strict";

var MQSClient = require('../lib/client');
var config = require('./config');
var assert = require('assert');

var client = new MQSClient(config);

var queue = 'test-node-sdk';

var testGetQueueAttr = function(){
    client.queue.getAttr(queue, function(err, data){
        assert.equal(data.DelaySeconds, '0', 'get queue attr failed');

        testSetQueueAttr();
    });
};

var testSetQueueAttr = function(){
    client.queue.setAttr(queue, {
        DelaySeconds: 1
    }, function(err){
        assert.equal(err, null, 'set queue attr failed');

        testGetQueueList();
    });
};

var testGetQueueList = function(){
    client.queue.list(null, null, queue, function(err, data){
        assert.ok(data.list.length > 0, 'get queue list failed');

        testSendMessage();
    });
};

var testSendMessage = function(){
    client.message.send(queue, {
        msg: 'test'
    }, function(err, data){
        assert.equal(err, null, 'send message failed');

        testGetMessage();
        
    });
};

var testGetMessage = function(){
    client.message.get(queue, 0, function(err, data){
        assert.equal(err, null, 'get message failed');
        testPeekMessage(data.ReceiptHandle);
    });
};

var testPeekMessage = function(ReceiptHandle){
    client.message.peek(queue, function(err, data){
        if(err === null || err.code === 'MessageNotExist'){
            testChangeMessage(ReceiptHandle);
        }
        else{
            assert.ok(false, 'peek message failed');
        }
    });
};

var testChangeMessage = function(ReceiptHandle){
    client.message.change(queue, ReceiptHandle, 3, function(err, data){
        assert.equal(err, null, 'change message failed');
        if(data && data.ReceiptHandle){
            testRemoveMessage(data.ReceiptHandle);
        }
        else{
            testRemoveQueue();
        }
    });
};

var testRemoveMessage = function(ReceiptHandle){
    client.message.remove(queue, ReceiptHandle, function(err, data){
        assert.equal(err, null, 'remove message failed');

        testRemoveQueue();
    });
};

var testRemoveQueue = function(){
    client.queue.remove(queue, function(err){
        assert.equal(err, null, 'remove queue failed');
        console.log('all test success!');
    });
};

var testCreateQueue = function(){
    client.queue.create(queue, {}, function(err, url){
        assert.ok(url, 'create queue failed');
        testGetQueueAttr();
    });
};

testCreateQueue();
