
(function(exports){

var async =  require('async');
var fetcher =  require('./fetcher');
var tools =  require('./tools');
var http_agent = require('./http_agent').http_agent;

var postAgent = function(url,data,callback){
	http_agent(url,{method:'POST', payload:data},function(err,data){
		callback(data,err);		
	});
}



function get_dir(url){
	return url.replace(/[^/]+$/,'');
}

var get_domain = function(url){
	return url.replace(/https?:\/\/([^/]+)\/.*/,'$1');
};

function extract_all(url,html){
	var ret = [];
	var uniq = {};
	var dir = get_dir(url);
	var domain = get_domain(url);
	var urls_q = html.match(/href\s*=[\s]*\\?"\s*\S+[\s]*\\?"/g) || [];
	var urls_n = html.match(/href\s*=\s*\s*[a-zA-z0-9%?=#/]+\s*/g) || [];

	var urls = [];
	if(urls_q) urls = urls.concat(urls_q);
	if(urls_n) urls = urls.concat(urls_n);
	for(var i in urls){
		var href = urls[i].replace(/href\s*=[^"]*"?\s*([^"]*)[\s]*"?/,'$1');
		href = href.replace(/\\$/,'');
		href = href.replace(/\\(.)/g,'$1');
		if(href[0]=='.'){
			href = href.replace(/^.\//,dir);
		}else if(href[0]=='/'){
			href = 'http://'+domain+href;
		}
		if(!(href in uniq)){
			uniq[href] = 1;
			ret.push(href);
		}
	}
	return ret;
}

function Worker(config){
	var _self = this;
	_self.config = tools.load({
		 base_url : 'http://127.0.0.1:8890/'		
		,parallel : 5
	},config);
	_self.cargo = async.cargo(function(jobs,done){
		var results = {};
		jobs.forEach(function(job){
			results[job.handler] = results[job.handler] || { results:[],  handler:job.handler , extra:job.extra  };
			results[job.handler].results.push(job.data);
		});
		var pack = [];
		for(var h in results) pack.push(results[h]);
		postAgent(_self.config.base_url+'ack',JSON.stringify(pack),function(data,err){
					delete jobs;
					delete results;
					delete pack;
					done();	
		});
	});
	_self.queue = async.queue(function(job,done){
		var url = job.url;
		fetcher.fetch(_self.config.base_url,url,function(err,html){
			if(!err){
				var href = extract_all(url,html);
				_self.cargo.push({handler:job.handler, extra:job.extra, data:{url:url, html:html,href:href}});
				done();
			}else done();
		});
	},_self.config.parallel);
	_self.jobDone = -1;
	_self.run = function(callback){
		if(! _self.queue.length()){
			_self.jobDone++;
			if(_self.jobDone >=16 && !(typeof window === 'undefined'))
				window.location.reload();
			postAgent(_self.config.base_url+'pull',"",function(job,err){
				if(err)	callback(err);	
				if(job&&job.length){
					try{
						job = JSON.parse(job);
						if(job.urls){
							console.log(Date(),_self.jobDone,'done,','job recieved',job.urls.length);
							job.urls.forEach(function(url){
								_self.queue.push({url:url,handler:job.handler,extra:job.extra});
							});
						}else{
							console.log(Date(),"job exceptions",job);
						}
					}catch(exe){
						console.log(Date(),'sth worng',exe);
					}finally{
						callback();
					}
				}else{
					console.log(Date(),_self.jobDone,'done,','empty job recieved');
					callback();
				}
			});
		}else {
			console.log(Date(),_self.jobDone,'done,','too busy');
			callback();
		}
	}
	function loop(err,sec){
		sec = sec || 10;
		setTimeout(function(){
			if(_self.on){
				_self.run(loop);
			}
		},sec*1000);
	}
	
	var icons = ['icon_on.png','icon_off.png'];
	_self.on = 0;
	_self.onClick = function(){
		if(typeof chrome != 'undefined') chrome.browserAction.setIcon({path:icons[_self.on]});
		_self.on = 1 - _self.on;
		if(_self.on){
			_self.run(loop);
		}
	}
}
exports.Worker = Worker;
exports.extract_all=extract_all;
})(typeof exports === 'undefined'? this['./worker']={}: exports);
