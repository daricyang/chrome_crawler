var tools = require('./tools');
var redis = require('redis-node');
var logger = require('log4js').getLogger(__filename.replace(/.*\/([^\/]+).js/,'$1'));
var async = require('async');

function Crawler(config){	
	var _self = this;
	_self.config = tools.load({
		name : "Crawler"
	},config);
	_self.queue = redis.createClient();
	_self.handlers = {};
	_self.callback = null;
}

/*
 * handler(
 * 		 data =>{
 * 		 	 url   : "url"
 * 		 	,html  : "html"
 * 		 	,href  : ["url"]
 * 		 	,extra : obj
 * 		 },callback(err  => true | false
 * 				,nexts => [ {  
 * 					 handler	: "handlerName"
 * 					,urls		: [urls] 
 * 					,extra		: obj (optional)
 * 				}]  //if handlerName is set to __self__, means itself
 * 			)
 * 		)
 * */
Crawler.prototype.setHandler = function(name,handler){
	this.handlers[name] = handler;
}

/*
 * arg => unuse yet
 * callback(err,{urls:[urls], handler:"handlerName" ,extra : obj })
 * */
Crawler.prototype.pull = function(arg,callback){		
	var _self = this;	
	_self.queue.lpop(_self.config.name,function(err,data){
		data = JSON.parse(data);
		callback(err,data);
	});
}

/*
 * tasks => [{
 * 		 handler : "handlerName"
 * 		,extra	 : obj
 *		,results : [
 *			{
 *				 url  : "url"
 *				,html : "html"
 *				,href : [ "url" ]
 *			}
 *		]
 * }]
 * */

Crawler.prototype.ack = function(tasks,callback){
	var _self = this;
	async.every(tasks,function(task,done){
		var handler = _self.handlers[task.handler];
		async.every(task.results,function(data,done){
			try{
				data.extra = task.extra;
				handler(data,function(err,nexts){
					if(err){done(true);}
					else{
						nexts.forEach(function(job){
							if(job.urls.length!=0){
       								if(job.handler == '__self__') job.handler = task.handler;
								_self.push(job)
							}
						});
					}
				},function(){
					done(true);
				});
			}catch(exe){logger.error(exe); done(true);}
		},function(all){done(true);});
	},function(all){callback();});
}

/*
 * task => {
 *		 urls 	 : [url]
 *		,handler : "handlerName"
 *		,extra	 : obj (optional)
 * }
 * cakllback(err)
 * */
Crawler.prototype.push = function(task,callback){
	var _self = this;
	task = JSON.stringify(task);
	_self.queue.rpush(_self.config.name,task);
	if(callback) callback();
}

function test(){
	var crawler = new Crawler({name:'hehe'});
	crawler.setHandler('handler',function(data,callback){
		console.log(data);
		//setTimeout(function(){
			callback(null,{'handler':[data.url]});
		//},1000);
	});
	crawler.push({urls:['http://192.168.86.216:10090/'],handler:"handler"});
	setInterval(function(){
		crawler.pull(null,function(err,task){
			var name = task.handler;
			var obj = {}; obj[name] = [{ url:task.urls[0],html:"",href:[task.urls[0]]  }]; 
			crawler.ack(obj); 
		});		
	},1000);
}
//test();
exports.Crawler = Crawler;
