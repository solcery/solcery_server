const Master = { api: { admin: {} } }

Master.api.admin.ctx = function(params, ctx) {
    assert(params.userId === 'TEUZkqw3bGDn4To6C7KNcckgoLiSLSZWaGJSWx8beFz');
}

Master.api.admin.reloadProjects = async function(params, ctx) {
    for (let project of this.core.getAll(Project)) {
        project.delete();
    }
    this.core.createProjects();
}

Master.api.admin.reloadProject = async function(params, ctx) {
    let project = this.core.get(Project, params.projectId);
    assert(project, 'No project');
    project.delete();
    let projectConfig = await this.core.solceryDb.objects.findOne({ template: 'projects', 'fields.name': params.projectId });
    this.core.create(Project, { 
        id: projectConfig.fields.name,
        ...projectConfig.fields,
    })
}

Master.api.admin.eval = async function(params, ctx) {
    assert(params.userId === 'TEUZkqw3bGDn4To6C7KNcckgoLiSLSZWaGJSWx8beFz');
    let code = params.code;
    try {
        var res = eval(params.code)
    } catch(e) {
        return e.message;
    } finally {
        return res;
    }
}

module.exports = Master;
