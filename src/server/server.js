var tools = require('./tools');
var logger = require('log4js').getLogger(__filename.replace(/.*\/([^\/]+).js/,'$1'));
var Url = require('url');

function Server(config){
	var _self = this;
	_self.config = tools.load({
		 port : 8888
		,host : '127.0.0.1'			
	},config);
	var http = require('http');
	_self.app = http.Server();
	_self.handlers = {};
	_self.app.on('request',function(req,res){
		req.setEncoding('utf8');
		var data = "";
		var path = Url.parse(req.url).pathname;
		var begin = new Date().getTime();
		var done = function(err_or_data,code){
			code = code || 200;
			res.statusCode = code;
			var err = null;
			if(code!=200){
				err = err_or_data;
				res.end(''+err_or_data,'utf8');
			}else if(err_or_data){
				res.end(JSON.stringify(err_or_data),'utf8');
			}else{
				res.end();
			}
			logger.info(code,path,(new Date().getTime()) - begin + " ms",err);
		}
		req.on('data',function(chunk){
			data += chunk;
		});
		req.on('end',function(){
			var obj = null;
			try{
				obj = JSON.parse(data);
			}catch(e){}
			var handler = _self.handlers[path];
			if(handler){
				try{
					handler(obj,function(err,data){
						if(err){	done(err,500);}
						else if(data){	done(data);}
						else{	done();}
					});
				}catch(exe){	done(exe,500);	}
			}else{	done();	}
		});	
	});
	_self.app.listen(_self.config.port,_self.config.host);
	logger.info('server running on ',_self.config.port);
}

Server.prototype.expose = function(path,func){
	this.handlers[path] = func;
}

function test(){
	var express = require('express')
	  , app = express.createServer();

	app.use(express.bodyParser());

	app.post('/', function(req, res){
		res.send(req.body);
	});
	app.listen(3000);

}
//test();

exports.Server = Server;
