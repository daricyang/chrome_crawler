var logger = require('log4js').getLogger(__filename.replace(/.*\/([^\/]+).js/,'$1'));

/*
 *	handler(
 *		data =>{
 *			 url  : "url"
 *			,html : "html"
 *			,href : ["url"]
 *		},callback(
 *			 err
 *			,nexts => { handlerName:[urls] }  //if handlerName is set to __self__, means itself
 *		)
 *	)
 * */

var assert = require('assert');
function test_handler(handler){
	var data = {
		 url  : "http://www.baidu.com/"
		,html : "<html>this is a test page</html>"
		,next : ["http://baike.baidu.com/"]
		,extra: "test"
	}
	handler(data,function(err,next){
		logger.debug(err,next);		
	});

}
var handlers = require('./handlers');
test_handler( handlers.saver );




