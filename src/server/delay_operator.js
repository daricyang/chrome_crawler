var logger = require('log4js').getLogger(__filename.replace(/.*\/([^\/]+).js/,'$1'));
var util = require('util');
var events = require('events');
var tools = require('./tools');
var queue = require('./priority_queue');

/*
 * flush operations within some interval
 * for operators with delay in minute level, might be more effective than system setTimeout
 */

function DelayOperator(config){
	var _self=this;
	//configs 
	_self.config = tools.load({
		name			: 'operator'
		,flush_interval	: 1000
		,auto_flush		: true
	},config);
	_self.queue = new queue();
	if(_self.config.auto_flush){
		_self.loop = setInterval(_self.flush.bind(_self),_self.config.flush_interval);
	}
}
DelayOperator.create=function(config){
	return new DelayOperator(config);
}
// call operator(item) after at least delay time
DelayOperator.prototype.push=function(item,operator,delay){
	delay = delay || 0;
	delay += new Date().getTime();
	this.queue.push({
			item:item
			,op:operator
		},-delay);
}
DelayOperator.prototype.close=function(){
	if(this.loop){
		clearInterval(this.loop);
		delete this.loop;
	}
	this.flush();
}
DelayOperator.prototype.flush=function(){
	//logger.info('['+this.config.name+']','flushing');
	var now = -(new Date().getTime());
	while(!this.queue.empty()){
		var pair = this.queue.top_and_priority();
		if(!pair || pair.priority < now ){
			break;
		}
		pair.value.op(pair.value.item);
		this.queue.pop();
	}
}

var assert=require('assert');
function test(){
	var interval = 1000;
	var op = new DelayOperator({
		flush_interval : interval
	});	
	var delays = [1000,2000,3000,4000];
	delays.forEach(function(t){
		op.push(new Date().getTime(),function(st){
			var now = new Date().getTime();
			logger.debug('begin time=',st,'now=',now);
			assert.equal(st+t<now,true,'should callback later');
			if(t==4000){
				op.close();
			}
		},t);
	});
}
//test();

module.exports = DelayOperator;


