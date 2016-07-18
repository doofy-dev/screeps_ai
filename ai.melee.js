/**
 * Created by teeebor on 2016-07-15.
 */
//Extending AI
var AI = require('ai');
//Overriding constructor
function Melee(creep) {
    this.base = AI;
    this.base(creep);
    this.memory.needCollect = false;
}
Melee.prototype = Object.create(AI.prototype);
Melee.prototype.constructor = Melee;
//Override: AI.doJob
Melee.prototype.doJob = function(){
    //Getting target
    var target = Game.getObjectById(this.roomMemory.attackTarget);
    //If has an enemy closer
    var hostile = this.creep.pos.findClosestByPath(FIND_HOSTILE_CREEPS);
    //if has target
    if(target!=null || hostile!=null) {
        console.log("target")
        this.setCreepMemory("canDo", true);
        //closer enemy is more important
        if(hostile!=target) {
            target = hostile;
            console.log("hostile")
        }
        //If not in range to attack, move to destination
        if (this.creep.attack(target) == ERR_NOT_IN_RANGE)
            this.moveTo(target)
    }else
        this.setCreepMemory("canDo", false);
};

module.exports = Melee;