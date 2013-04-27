var logger = require('log4js').getLogger(__filename.replace(/.*\/([^\/]+).js/,'$1'));
var Server = require('./server').Server;
var Crawler = require('./crawler').Crawler;
var Handlers = require('./handlers');
var Cookie=require('./cookie').Cookie;

function reset(){
	var redis = require('redis-node').createClient();
	redis.del('tencent');
	redis.del('Crawler');
}

function create(){
	var server = new Server({port:8890});
	var crawler = new Crawler({name:'Crawler'});
	//var cookie=new Cookie({ip:'192.168.86.216'});
	var cookie=new Cookie();	
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
	server.expose('/get_cookie/sina',cookie.getCookie.bind(cookie));
	server.expose('/get_cookie/tencent',cookie.get_qq_cookie.bind(cookie));
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
	pushUser('1773283005');
	pushUser('2080182621');
	
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
		crawler.push({urls:urls,handler:'tencent_people'});
		urls=null;
	}
	 push_qq_user({uid:'daricyang',following:134,follower:39});
	/*-----------end tencent method---------------*/
}


function main(){
	//reset();
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


