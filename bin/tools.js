(function(exports){

//get all keys of an obj
exports.allkeys=function(obj){
	var ret=[];
	for(var k in obj){
		ret.push(k);
	}
	return ret;
}
exports.load_config_with_default=function(dc,config){
	var ret={};
	for(var k in dc){
		if(config && k in config) ret[k] = config[k];
		else ret[k]=dc[k];
	}
	return ret;
}
exports.load = exports.load_config_with_default;

function data_walk(data){
	if(typeof(data)=='string'){
		ret = data;
		console.log('walking string ' + data);
		try{
			eval('ret='+data);
		}catch(exc) {
			console.log(exc);
			sp = data.split('.');
			if(sp.length==3 || sp.length==2){
				try{
					mod = sp.length==2 ? sp[0] : sp[0]+'.'+sp[1];																
					console.log('loading module : ' + mod);
					mod = require(mod);
					ret = mod[sp[sp.length-1]];
				}catch(exc){
					console.log(exc);
				}
			}
		}
	}else{
		for(var i in data){
			data[i] = data_walk(data[i]);
		}
		ret = data;
	}
	return ret;
}

exports.parse=function(config){
	var ret= data_walk(config);
	console.log(config.analyzer);
	return ret;
}

function regMapper(){
	this.regs = [];
	this.reg_strings = {};
}
regMapper.prototype.find=function(key){
	var ret = [];
	for(var i in this.regs){
		reg = this.regs[i];
		if(reg.test(key)){
			ret.push(reg.source);
		}
	}	
	return ret;
}
regMapper.prototype.add=function(reg_string){
	if(! (reg_string in this.reg_strings)){
		var tobe = new RegExp(reg_string);
		this.regs.push(tobe);
		this.reg_strings[reg_string] = 1;
	}
}
exports.regMapper=regMapper;

})(typeof exports === 'undefined'? this['./tools']={}: exports);


