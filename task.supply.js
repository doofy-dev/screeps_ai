/**
 * Created by teeebor on 2016-07-24.
 */
let Task = require("task");
let types = [STRUCTURE_STORAGE, STRUCTURE_CONTAINER];
function Supply(ai) {
    this.base = Task;
    this.base(ai);
}
Supply.prototype = Object.create(Task.prototype);
Supply.prototype.constructor = Supply;

Supply.prototype.search = function () {
    let dest = this.ai.findBy(STRUCTURE_TOWER,(object)=>object.energy<presets.tower_max_supply);
    if(dest != null){
        this.ai.setDestination(dest.id)
    }else{
        this.ai.setDestination(null);
    }
};

Supply.prototype.canDo = function () {
    let dest = this.ai.findBy(STRUCTURE_TOWER,(object)=>object.energy<presets.tower_max_supply);
    return this.ai.creep.energy>0 && dest.length>0;
};

Supply.prototype.do = function () {
    let destination = this.ai.getDestination();
    if(destination!=null) {
        if (this.ai.creep.transfer(destination)) {
            this.ai.move();
        }
    }
};

module.exports = Supply;