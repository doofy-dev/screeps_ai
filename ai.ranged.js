/**
 * Created by teeebor on 2016-07-15.
 */
var AI = require('ai');
function Ranged(creep) {
    this.base = AI;
    this.base(creep);
    this.memory.needCollect = false;
}
Ranged.prototype = Object.create(AI.prototype);
Ranged.prototype.constructor = Ranged;
Ranged.prototype.doJob = function(){
    var target = Game.getObjectById(this.roomMemory.attackTarget);
    var hostile = this.creep.pos.findClosestByPath(FIND_HOSTILE_CREEPS);
    if(target!=null) {
        this.setCreepMemory("canDo", true);
        if(hostile!=target)
            target = hostile;
        if (this.creep.rangedAttack(target) == ERR_NOT_IN_RANGE)
            this.moveTo(target)
    }else
        this.setCreepMemory("canDo", false);
};

module.exports = Ranged;