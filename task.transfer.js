/**
 * Created by teeebor on 2016-07-24.
 */
let Task = require("task");
let types = [STRUCTURE_EXTENSION,STRUCTURE_SPAWN];

function Transfer(ai) {
    this.base = Task;
    this.base(ai);
}
Transfer.prototype = Object.create(Task.prototype);

Transfer.prototype.constructor = Transfer;

Transfer.prototype.search = function () {
    let dest = this.ai.findClosestByTypes(types);
    if(dest != null){
        this.ai.setDestination(dest.id)
    }else{
        this.ai.setDestination(null);
    }
};

Transfer.prototype.canDo = function () {
    let dest =Game.getObjectById(this.ai.memory.destination.id);
    return this.ai.creep.carry.energy > 0 &&((this.ai.withTypes(dest,types) && dest.energy <dest.energyCapacity) || this.ai.findClosestByTypes(types)!=null);
};

Transfer.prototype.do = function () {
    let dest =this.ai.getDestination();
    if(dest!=null){
        let state = this.ai.creep.transfer(dest, RESOURCE_ENERGY);
        // console.log("transfering",state)
        if(state ==ERR_NOT_IN_RANGE)
            this.ai.move();
    }
};

module.exports = Transfer;