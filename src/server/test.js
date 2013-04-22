var logger = require('log4js').getLogger(__filename.replace(/.*\/([^\/]+).js/,'$1'));
function test_push(){
	var kue = require('kue');
	var queue = kue.createQueue();
	var task = { "foo": { "bar": true }, "data": [10, 20] };
	for(var i=0;i<100;++i){
		queue.create('dummy',task).save();
	}
	console.log('done!');
}

function test_worker(){
	var queue = kue.createQueue();
	queue.process('dummy',function(job,callback){
		console.log(job.data);
		
		callback();
	});
}


function test_front_end(){
	kue.app.listen(3000);
}

function test_redis(){
	var redis = require('redis-node');		
	var client = redis.createClient();
	client.lpush('hehe',123,function(err){
		client.rpop('hehe',function(one,two,three){
			console.log(one);
			console.log(two);
			console.log(three);		
		});		
	});
	client.sadd('kaka',123,function(err,stat){
		console.log('haha',err,stat);
	});
}

function test_async(){
	var async = require('async');
		
}

function testProcesses(){
	var cluster = require('cluster');
	var	numCPUs = require('os').cpus().length;
	var http = require('http');
	if(cluster.isMaster){
		numCPUs = 2;
		for(var i =0;i<numCPUs;++i){
			cluster.fork();
		}
		cluster.on('exit', function(worker, code, signal) {
			console.log('worker ' + worker.process.pid + ' died');
		});
	}else{
		http.createServer(function(req, res) {
			res.writeHead(200);
			res.end("hello world from " + cluster.worker.id + "\n");
		}).listen(8000);
	}
}

function testNodeDummyCache(){
	var factory = require('node-dummy-cache');
	var cache 	= factory.create(100,function(id,callback){
		callback(undefined,{});		
	});
	cache.get(1,function(err,user){
		logger.debug(err,user,1);		
		user.haha = 1;
		cache.get(1,function(err,user){
			logger.debug(err,user,2);		
		});
		cache.get(2,function(err,user){
			logger.debug(err,user,3);		
		});
	});
}

function test(){
	var url = 'http://weibo.com/2126870482/fans?page=6';
	//url = 'http://192.168.86.216:10090/';
	var fetcher = require('./fetcher');
	fetcher.fetch(url,function(err,data){
		console.log(err);
		console.log(data);			
	});
}
function test_cookie(){
	var worker=require('./worker');
	var url="https://weibo.com/u/1910034497?leftnav=1&wvr=5";
	console.log(worker.get_dir(url));
}

function test_worker1(){
	var fetcher=require('./fetcher');
	var worker=require('./worker');
	var url='weibo.com/180579184follow?page=2';
	fetcher.fetch(url,function(err,data){
		if(err) console.log(err);
		else{
			var ret=worker.extract_all(url,data);
			ret.forEach(function(item){
				console.log(item);
			});
		}
	});
}

function test_ser(){
	var ag=require('./http_agent').http_agent;
	ag('127.0.0.1:8890/ack','',function(err,date){
		if(err) console.log(err);
		console.log(data);
	});
}

function test_cookie(){
	var url='http://1.t.qq.com/home_userinfo.php?u=arloou';
	var fetch=require('./fetcher').fetch;
	fetch(url,function(err,date){
		if(err) console.log(err);
		else console.log(date);	
	});
}
test_cookie();
//test_ser();
//test_worker1();

//test_cookie();

//test();
//test_worker();
//test_front_end();
//
