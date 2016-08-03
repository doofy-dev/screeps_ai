/**
 * Created by teeebor on 2016-07-24.
 */
let Task = require("task");
function Build(ai) {
    this.base = Task;
    this.base(ai);
}
Build.prototype = Object.create(Task.prototype);

Build.prototype.constructor = Build;

Build.prototype.search = function () {
    this.ai.setDestination(this.ai.creep.room.memory.task.build)
};

Build.prototype.canDo = function () {
    return this.ai.creep.carry.energy > 0 && this.ai.creep.room.memory.task.build!=null;
};

Build.prototype.do = function () {
    let dest = this.ai.getDestination();
    if(dest!=null && this.ai.creep.build(dest)==ERR_NOT_IN_RANGE)
        this.ai.move();
};

module.exports = Build;