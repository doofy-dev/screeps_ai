/**
 * Created by teeebor on 2016-07-24.
 */
let Task = require("task");
function Repair(ai) {
    this.base = Task;
    this.base(ai);
}
Repair.prototype = Object.create(Task.prototype);

Repair.prototype.constructor = Repair;

Repair.prototype.search = function () {
    this.ai.setDestination(this.ai.creep.room.memory.task.repair)
};

Repair.prototype.canDo = function () {
    return false;
    return this.ai.creep.carry.energy > 0 && this.ai.creep.room.memory.task.repair != null;
};

Repair.prototype.do = function () {
    let dest = this.ai.getDestination();
    if (dest != null)
        if (this.ai.creep.repair(dest) == ERR_NOT_IN_RANGE)
            this.ai.move();
};

module.exports = Repair;