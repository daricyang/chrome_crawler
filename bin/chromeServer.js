var logger = require('log4js').getLogger(__filename.replace(/.*\/([^\/]+).js/,'$1'));
var Server = require('./server').Server;
var Crawler = require('./crawler').Crawler;
var Handlers = require('./handlers');

function reset(){
	var redis = require('redis-node').createClient();
	redis.del('weibo:users');
	redis.del('Crawler:1');
}

function create(){
	var server = new Server({port:8890});
	var crawler = new Crawler({name:'Crawler'});
	server.expose('/pull',crawler.pull.bind(crawler));
	server.expose('/ack',crawler.ack.bind(crawler));
	server.expose('/push_url',function(arg,callback){
	if(typeof(arg.extra)=='string' && arg.urls instanceof Array)
		{
			arg.handler = 'saver';
			crawler.push(arg);
			callback();
		}
	});

	//to-do : danger!!! alwarys returning the first cookie
	server.expose('/get_cookie/sina',function(arg,callback){
		var mongodb = require('mongodb');					
    		var server = new mongodb.Server("127.0.0.1", 27017);
   		new mongodb.Db('people', server, {safe:false}).open(function (error, client) {
    		if(error) { callback(error,null); }
			else{
      			var collection = new mongodb.Collection(client, 'c_login_cookie');
      			collection.findOne({status:"available"},function(err,doc){
					if(err) callback(err,null);
					else if(doc.cookie) {
						var login={
							logincookie:doc.cookie,
							date:new Date().getHours()
						}
						callback(null,login);
					}
					client.close();		
				});
			}
    	});
	});
	crawler.setHandler('weibo_people',Handlers.weiboPeople);
	crawler.setHandler('saver',Handlers.saver);
	crawler.setHandler('tencent_people',Handlers.tencentPeople);

	function pushUser(uid){
		crawler.push({
				 urls : [
				 	 "http://weibo.com/"+uid+"/fans"
					,"http://weibo.com/"+uid+"/follow"
				 	,'http://weibo.com/'+uid+"/info"]
				,handler : "weibo_people"
		});
	}
	//pushUser('1665469755');
	//pushUser('1804605290');
	
	/*----------tencent method------------------*/
	//userObj={uid:String,following:number,follower:number};
	function push_qq_user(userObj){
		var urls=[];
		urls.push('http://1.t.qq.com/home_userinfo.php?u='+userObj.uid);
		for(var i=1;i<=Math.ceil(userObj.following/15.0);i++){
			urls.push('http://1.t.qq.com/asyn/following.php?u='+userObj.uid+'&&time=&page='+i+'&id=&apiType=4&apiHost=http%3A%2F%2Fapi.t.qq.com&_r=1365666653702');
		}
		for(var i=1;i<=Math.ceil(userObj.follower/15.0);i++){
			urls.push('http://1.t.qq.com/asyn/follower.php?u='+userObj.uid+'&&time=&page='+i+'&id=&apiType=4&apiHost=http%3A%2F%2Fapi.t.qq.com&_r=1365666653702');
		}
		console.log(urls.length);
		crawler.push({urls:urls,handler:'tencent_people'});
		urls=null;
	}
	push_qq_user({uid:'daricyang',following:134,follower:39});
	/*-----------end tencent method---------------*/
}


function main(){
	reset();
	var cluster = require('cluster');
	var workerNum = 2;
	if(cluster.isMaster){
		for(var i =0;i<workerNum;++i){  
			cluster.fork();
		}
	}else{
		setTimeout(create,1000);
	}
}

main();


