/**
 * Created by teeebor on 2016-07-15.
 */
var AI = require('ai');
function Engineer(creep) {
    this.base = AI;
    this.base(creep);
}
Engineer.prototype = Object.create(AI.prototype);
Engineer.prototype.constructor = Engineer;
Engineer.prototype.doJob = function(){
    var constructionSite = Game.getObjectById(this.roomMemory.buildTask);
    var repair = Game.getObjectById(this.roomMemory.repairTask);
    if(repair!=null){
        this.setCreepMemory("canDo", true);
        if (this.creep.build(repair) == ERR_NOT_IN_RANGE)
            this.moveTo(repair)
    }
    else {
        if (constructionSite != null) {
            this.setCreepMemory("canDo", true);
            if (this.creep.build(constructionSite) == ERR_NOT_IN_RANGE)
                this.moveTo(constructionSite)
        } else
            this.setCreepMemory("canDo", false);
    }
};

module.exports = Engineer;