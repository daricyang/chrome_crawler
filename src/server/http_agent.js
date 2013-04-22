(function(exports){

/*
	options: {
		 method  : 'GET'/'POST'
		,headers : {}
		,payload : 'content string' 
	}
	callback(err,body)
*/

var http_agent = function(url,option,callback){
	if(typeof window === 'undefined'){
		//in nodejs
		var fetch = require('fetch').fetchUrl;
		fetch(url,option,function(err,meta,body){
			if(err) callback(err);
			else callback(err,body.toString());
		});
	}else{
		//in browser
		var arg = {
			 url   : url
			,success : function(data){
				callback(null,data);		
			}
		};
		if(option.method) arg.type = option.method;
		if(option.payload) arg.data = option.payload;
		$.ajax(arg).fail(function(jqXHR,msg){
			callback(msg,null);		
		});
	}
}
function test(){
	var url = 'http://127.0.0.1:8888/';
	//url = 'http://192.168.86.216:8890/get_cookie/sina';
	var data = 'xixi & hehe';
	http_agent(url,{},function(err,data){
		console.log(err);
		console.log(data);		
	});
	http_agent(url,{method:'POST',headers:{xii:'hehe'},payload:'this is a payload'},function(err,data){
		console.log(err);
		console.log(data);		
	});
	http_agent(url+'cookie',{headers:{Cookie:'hahahahahah there should be a cookie'}},function(err,data){
		console.log(err);
		console.log(data);		
	});
}
//test();
exports.http_agent = http_agent;
})(typeof exports === 'undefined'? this['./http_agent']={}: exports);

