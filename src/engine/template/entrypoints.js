const Master = { entrypoints: {} }

Master.entrypoints.template = async function(params, ctx) {
	ctx.template = await this.content.templates.findOne({ code: params.templateCode })
	assert(ctx.template, `No template with id '${params.templateCode}' found!`);
}

module.exports = Master;
