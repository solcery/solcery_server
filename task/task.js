const Master = {}

Master.onCreate = function(data) {
	this.function = data.function;
	this.onSuccess = data.onSuccess;
	this.onFailure = data.onFailure;
	if (!data.hold) this.run;
}

Master.run = function() {
	this.function().then(
		res => this.parent.execAllMixins(this.onSuccess, res),
		err => this.parent.execAllMixins(this.onFailure, err)
	);
}

module.exports = Master
