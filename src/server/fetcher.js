(function(exports){
		var http_agent=require('./http_agent').http_agent;
		var login={};
		//todo: may need to add failure check, what if the cookies fail during the 12 hours?
		var getWeiboCookie=function(base_url,callback){
			var timeSlice=25;
			if(login.date){	
				var curDate=new Date().getHours();
				if(curDate<login.date){
					timeSlice=24+curDate-login.date;
				}else{
					timeSlice=curDate-login.date;
				}			
			}
			if(timeSlice>12){
				var url = base_url+'get_cookie/sina';
				http_agent(url,{},function(err,data){
					try{
						login.date=new Date().getHours();
						login.logincookie=JSON.parse(data).cookie;
						callback(null,login);
					}catch(e){
						callback(e);
					}
				});
			}else{
				callback(null,login);
			}
		};

/*-----------------------------------
 *	tencent	methods
 *	getTencent cookie(callback)---callback(err,cookieObj)
 *-----------------------------------
 */
		var getTencentCookie=function(base_url,callback){
			var timeSlice=25;
			if(login.qq_date){
				var curDate=new Date().getHours();
				if(curDate<login.qq_date){
					timeSlice=24+curDate-login.qq_date;	
				}else{
					timeSlice=curDate-login.qq_date;
				}
			}
			if(timeSlice>12){
				var url = base_url+'get_cookie/tencent';
				http_agent(url,{},function(err,data){
					try{
						login.qq_date=new Date().getHours();
						login.qq_cookie=JSON.parse(data).cookie;
						callback(null,login);
					}catch(e){
						callback(e);
					}
				});
			}else{
				callback(null,login);
			}
		};	
		//todo: seperate different agent	
		//todo: move every 'require' statement outside a function, use it like a "#include" in c
		var agent=function(cookie,url,callback){
			function do_callback(err,data){
				if(err) callback(err,null);
				else if(data)callback(null,data);
			}
			if(cookie==='undefined') do_callback('cannot get cookie',null);
			else{
				if(cookie!=null)	cookie=cookie.split(';');
				var referer=null,host=null;
				if(url.match(/1.t.qq.com/)){
					host='1.t.qq.com';
					if(url.match(/\/following/)){
						url.match(/u=(.*?)&&/);
						referer='http://1.t.qq.com/'+RegExp.$1+'/following';
					}else if(url.match(/\/follower/)){
						url.match(/u=(.*?)&&/);
						referer='http://1.t.qq.com/'+RegExp.$1+'/follower';
					}
				}else if(url.match('weibo.com')){
					host='weibo.com';
				}
				http_agent(url,{
						headers:{
							'Accept':'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
							'Accept-Charset':'GBK,utf-8;q=0.7,*;q=0.3',
							'Accept-Encoding':'gzip,deflate,sdch',
							'Accept-Language':'zh-CN,zh;q=0.8',
							'Cache-Control':'max-age=0',
							'Connection':'keep-alive',
							'Host':host,
							'Referer':referer,
							'User-Agent':'Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.4 (KHTML, like Gecko) Chrome/22.0.1229.95 Safari/537.4',
						},
						cookies:cookie
					},function(err,data){
						do_callback(err,data);
					}
				);
			}
		};

		var fetch = function(base_url,url,callback){
			if(url.match("weibo.com")){
				getWeiboCookie(base_url,function(err,login){
					if(err) {
						callback(err,null)
					}
					else agent(login.logincookie,url,function(err,data){
							if(err) callback(err);
							else{
								callback(null,data);
							}
						});    
				});
			}else if(url.match('t.qq.com')){
				getTencentCookie(base_url,function(err,login){
					if(err)	callback(err);
					else	agent(login.qq_cookie,url,function(err,data){
							if(err)	callback(err);
							else 	callback(null,data);
						});
				});
			}else{
				agent(null,url,callback);
			}
		}	
		exports.fetch=fetch;


		function test(){
			fetch("http://127.0.0.1:8890/","http://weibo.com/1665469755/fans",function(err,data){
				if(err) console.log(err);
				console.log(data);
			});
		}
	
	
	//test();
})(typeof exports === 'undefined'? this['./fetcher']={}: exports);

