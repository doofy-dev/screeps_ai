/**
 * Created by teeebor on 2016-07-15.
 */
//Extending AI
var AI = require('ai');
//Overriding constructor
function Ranged(creep) {
    this.base = AI;
    this.base(creep);
    this.memory.needCollect = false;
}
Ranged.prototype = Object.create(AI.prototype);
Ranged.prototype.constructor = Ranged;
//Override: AI.doJob
Ranged.prototype.doJob = function(){
    //Getting target
    var target = Game.getObjectById(this.roomMemory.attackTarget);
    //If has an enemy closer
    var hostile = this.creep.pos.findClosestByPath(FIND_HOSTILE_CREEPS);
    //if has target
    if(target!=null || hostile!=null) {
        this.setCreepMemory("canDo", true);
        //closer enemy is more important
        if(hostile!=target)
            target = hostile;
        //If not in range to ranged attack, move to destination
        if (this.creep.rangedAttack(target) == ERR_NOT_IN_RANGE)
            this.moveTo(target)
    }else
        this.setCreepMemory("canDo", false);
};

module.exports = Ranged;