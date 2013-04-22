(function(exports){
	var mongo=require('mongodb');
	var getCookie=function(callback){
		var client=new mongo.Db('people',new mongo.Server("127.0.0.1",27017),{fsync:true});
		client.open(function(err){
			if(err) callback(err);
			else	client.collection('c_login_cookie',function(err,collection){
				if(err) callback(err);
				else	collection.findOne({"status":"available"},function(err,obj){
						if(err)	callback(err);
						else	callback(null,{date:new Date().getHours(),logincookie:obj.cookie});
					});
			});
		});
	};
	exports.getCookie=getCookie;


	var get_qq_cookie=function(callback){
		var client=new mongo.Db('people',new mongo.Server('127.0.0.1',27017),{fsync:true});
		client.open(function(err){
			if(err)	callback(err);
			else{
				client.collection('c_login_qqcookie',function(err,collection){
					if(err) callback(err);
					else	collection.findOne({"status":"available"},function(err,obj){
							if(err)	callback(err);
							else	callback(null,obj);
						});
				});
			}
		});
	};

	exports.get_qq_cookie=get_qq_cookie;

	var test=function(){
		get_qq_cookie(function(err,cookieObj){
			if(err)	console.log(err);
			else	console.log(JSON.stringify(cookieObj));
		});
	};
	//test();
})(typeof exports==='undefined'?this['./cookie']={}:exports);
