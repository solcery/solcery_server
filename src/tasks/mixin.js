const Master = {} // TODO

Master.onCreate = function(data) {
	this.free = true;
	this.tasks = {};
}

Master.addTask = function(taskId) {
	taskId = taskId ?? uuid();
	assert(!this.tasks[taskId], 'Error adding task: task with same id already exists');
	this.tasks[taskId] = {
		id: taskId,
		completed: false,
	}
	this.free = false;
}

Master.completeTask = function(taskId) {
	if (this.tasks[taskId] === undefined) return; // Task
	this.tasks[taskId].completed = true;
	for (let task of Object.values(this.tasks)) {
		if (!task.completed) return;
	}
	this.free = true;
}

module.exports = Master;
