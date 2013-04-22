var logger = require('log4js').getLogger(__filename.replace(/.*\/([^\/]+).js/,'$1'));
var tools = require('./tools');

/*
	when flush_limit reaches, flush operators
	,or may flush within flush_delay 
*/

function BatchOperator(config){
	var _self=this;
	//configs
	_self.config = tools.load({
		name			: 'operator'
		,flush_delay	: 1000
		,auto_flush		: true
		,flush_limit	: 100
		,op				: function(items){}
	},config);
	_self.queue = [];
}

BatchOperator.create=function(config){
	return new BatchOperator(config);
}
//add an operation item
BatchOperator.prototype.push=function(item){
	this.queue.push(item);
	if(!this.config.auto_flush) return;
	if(this.queue.length >= this.config.flush_limit){
		this.flush();
		return ;
	}
	if(!this.timer ){
		this.timer = setTimeout(this.flush.bind(this),this.config.flush_delay);
	}
}
BatchOperator.prototype.close=function(){
	if(this.timer){
		clearTimeout(this.timer);
		delete this.timer;
	}
	if(this.queue.length>0) this.config.op(this.queue);
}
//flush manually
BatchOperator.prototype.flush=function(){
	logger.info('['+this.config.name+']','flushing');
	//clean so that later operators could push again
	var to_flush = this.queue;
	this.queue = [];
	this.close();
	//flush the operators
	this.config.op(to_flush);
}

var assert=require('assert');
function test(){
	var interval = 1000;
	var later = [];	
	var op = new BatchOperator({
		flush_delay	: interval
		,flush_limit	: 5
		,op			: function(items){
			logger.debug(items);
			later = later.concat(items);
			logger.debug(later);
		}
	});	
	var origin = [1,2,3,4,5,6];
	origin.forEach(function(t,i){
		if(i==5){
			assert.equal(later.length,5,'should have 5 inside');
		}
		op.push(i);
	});
	assert.equal(later.length,5,'should have 5 inside');
	setTimeout(function(){
		assert.equal(later.length,6,'should have 6 inside');
	},interval+100);
}
//test();

module.exports = BatchOperator;


