阿里云MQS nodejs SDK
===================

### demo

```js
var MQSClient = require('aliyun_mqs');

var client = new MQSClient({
    accessKeyId: 'you accessKeyId',
    accessKeySecret: 'you accessKeySecret',
    url: 'http://{you}.aliyuncs.com'
});

//创建队列
client.queue.create('test', {}, function(err, url){
    if(!err){
        //发消息
        client.message.send('test', {
            msg: 'test'
        }, function(err, data){
            console.log(data);
        });
    }
});
```


