// Copyright (c) 2011 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

var Worker = require('./worker');
var worker = new Worker.Worker();
chrome.browserAction.onClicked.addListener(worker.onClick.bind(worker));
worker.onClick();
//onClick();
//chrome.browserAction.setIcon({path:'icon1.png'});

function test(){
	console.log('hello world');
	setTimeout(function(){
//		window.location.reload();
	},1000);

	var url = "http://weibo.com/1662766362/follow";
	url = "http://weibo.com/1662766362/info";
	url = "http://weibo.com/1813594923/info";
	//url = "http://172.18.218.28/tmp/test.html";
	//url = "http://weibo.com//1280023112\\/fans"
	$.get(url,function(html){
		//console.log(html);	return ;
		var hrefs = extract_all(url,html);
		console.log(hrefs);
		console.log(hrefs.length);
		//html = html.replace(/[\s]/,' ');
		var reg = /<script>STK && STK.pageletM && STK.pageletM.view\((.*)\)<\/script>/g ;
		var ma = html.match(reg);
		ma.forEach(function(s){
			s = s.replace(reg,"$1");
			s = JSON.parse(s);
			if(s.pid == "pl_profile_infoBase"){
				console.log(s);	
				var dom = $(s.html);
				var res = [];
				dom.find('[class="pf_item clearfix"]').each(function(){
					var dd = $(this);
					var key = dd.find('[class="label S_txt2"]')[0].innerHTML;
					var value = dd.find('[class="con"]');	
					if(value.length ==0){
						value = dd.find();
					}else value = value[0].html();
					console.log(key+' '+value);
					res.push([key,value])	
				});
				console.log(res);
			}
		});
	});
}
//test();
