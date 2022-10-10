const Master = {}

Master.onApiCommand = async function(commandPath, result, params) {
      if (commandPath[0] !== 'project') return;
      let command = commandPath[1];
      let projectId = params.projectId;
      let editor = this.core.get(Editor, projectId)
      assert(editor, `API Error: No project with id '${projectId}'`);
      let callbackName = 'onApiCommand' + command.charAt(0).toUpperCase() + command.slice(1);
      await editor.execAllMixins(callbackName, result, params);
}

module.exports = Master;
