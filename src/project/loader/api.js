const Master = { api: { admin: {} } }

Master.api.admin.reloadProjects = async function(params, ctx) {
    await this.core.loadProjects();
}

Master.api.admin.reloadProject = async function(params, ctx) {
    await this.core.loadProject(params.projectId)
}

module.exports = Master;
