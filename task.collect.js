/**
 * Created by teeebor on 2016-07-24.
 */
let Task = require("task");
let types = [STRUCTURE_STORAGE, STRUCTURE_CONTAINER];
function Collect(ai) {
    this.base = Task;
    this.base(ai);
}
Collect.prototype = Object.create(Task.prototype);

Collect.prototype.constructor = Collect;

Collect.prototype.search = function () {
    let dest = this.ai.findClosestByTypes(types);
    if(dest != null){
        this.ai.setDestination(dest.id)
    }else{
        this.ai.setDestination(null);
    }
};

Collect.prototype.canDo = function () {
    return false;
   return this.ai.getFreeSource()!=null && (this.ai.creep.energy!=this.ai.creep.carryCapacity && this.ai.memory.task == "collect");
};

Collect.prototype.do = function () {
    let destination = this.ai.getDestination();
    if(destination!=null) {
    if (this.ai.creep.harvest(destination)) {

        }
    }
};

module.exports = Collect;