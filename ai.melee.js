/**
 * Created by teeebor on 2016-07-15.
 */
var AI = require('ai');
function Melee(creep) {
    this.base = AI;
    this.base(creep);
    this.memory.needCollect = false;
}
Melee.prototype = Object.create(AI.prototype);
Melee.prototype.constructor = Melee;
Melee.prototype.doJob = function(){
    var target = Game.getObjectById(this.roomMemory.attackTarget);
    var hostile = this.creep.pos.findClosestByPath(FIND_HOSTILE_CREEPS);
    if(target!=null) {
        console.log("target")
        this.setCreepMemory("canDo", true);
        if(hostile!=target) {
            target = hostile;
            console.log("hostile")
        }
        if (this.creep.attack(target) == ERR_NOT_IN_RANGE)
            this.creep.moveTo(target)
    }else
        this.setCreepMemory("canDo", false);
};

module.exports = Melee;