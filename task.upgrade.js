/**
 * Created by teeebor on 2016-07-24.
 */
let Task = require("task");
let types = [STRUCTURE_EXTENSION, STRUCTURE_SPAWN];
function Upgrade(ai) {
    this.base = Task;
    this.base(ai);
}
Upgrade.prototype = Object.create(Task.prototype);

Upgrade.prototype.constructor = Upgrade;

Upgrade.prototype.search = function () {
    this.ai.setDestination(this.ai.creep.room.controller.id)
};

Upgrade.prototype.canDo = function () {
    return this.ai.creep.carry.energy > 0 && this.ai.creep.room.controller.my;
};

Upgrade.prototype.do = function () {
    let dest = this.ai.getDestination();
    if (dest != null)
        if (this.ai.creep.transfer(dest, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE)
            this.ai.move();
};

module.exports = Upgrade;