const Master = {};

Master.onCreate = function(data) {
    this.create(Editor, { id: 'polygon', projectId: 'polygon' });
}

module.exports = Master
