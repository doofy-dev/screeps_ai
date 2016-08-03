/**
 * Created by teeebor on 2016-07-24.
 */
let Task = require("task");
function Harvest(ai) {
    this.base = Task;
    this.base(ai);
}
Harvest.prototype = Object.create(Task.prototype);

Harvest.prototype.constructor = Harvest;

Harvest.prototype.search = function () {
    let source = this.ai.getFreeSource();
    if(source != null){
        this.ai.setDestination(source.id)
    }else{
        this.ai.setDestination(null);
    }
};

Harvest.prototype.canDo = function () {
    return (this.ai.creep.carry.energy == 0) ||(this.ai.creep.carry.energy!=this.ai.creep.carryCapacity)
            ;
};

Harvest.prototype.do = function () {
    let destination = this.ai.getDestination();
    if(destination!=null)
        if(this.ai.creep.harvest(destination)==ERR_NOT_IN_RANGE){
            this.ai.move();
        }
};

module.exports = Harvest;