
/**
 * Created by teeebor on 2016-07-24.
 */
let Task = require("task");
let types = [STRUCTURE_STORAGE];
function TransferClose(ai) {
    this.base = Task;
    this.base(ai);
}
TransferClose.prototype = Object.create(Task.prototype);

TransferClose.prototype.constructor = TransferClose;

TransferClose.prototype.search = function () {
    let dest = this.ai.findClosestByTypes(types);
    if(dest != null){
        this.ai.setDestination(dest.id)
    }else{
        this.ai.setDestination(null);
    }
};

TransferClose.prototype.canDo = function () {
    let dest =this.ai.getDestination();
    let p;
    if(dest.structureType==STRUCTURE_CONTAINER)
        p=(this.ai.withTypes(dest,types) && dest.store[RESOURCE_ENERGY] <dest.storeCapacity);
    else
       p= (this.ai.withTypes(dest,types) && dest.energy <dest.energyCapacity);
    return this.ai.creep.carry.energy > 0 &&( p|| this.ai.findClosestByTypes(types)!=null);
};

TransferClose.prototype.do = function () {
    let dest =this.ai.getDestination();
    if(dest!=null) {
        let state = this.ai.creep.transfer(dest, RESOURCE_ENERGY);
        if (state == ERR_NOT_IN_RANGE)
            this.ai.move();
    }
};

module.exports = TransferClose;