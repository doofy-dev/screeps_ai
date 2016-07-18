/**
 * Created by teeebor on 2016-07-15.
 */
//Extending AI
var AI = require('ai');
function Engineer(creep) {
    this.base = AI;
    this.base(creep);
}
Engineer.prototype = Object.create(AI.prototype);
Engineer.prototype.constructor = Engineer;
//Override: AI.doJob
Engineer.prototype.doJob = function(){
    //Getting build task
    var constructionSite = Game.getObjectById(this.roomMemory.buildTask);
    //Getting repair task
    var repair = Game.getObjectById(this.roomMemory.repairTask);
    //If needs to repair
    if(repair!=null){
        this.setCreepMemory("canDo", true);
        //If not in range to build, move to destination
        if (this.creep.build(repair) == ERR_NOT_IN_RANGE)
            this.moveTo(repair);
    }
    else {
        //If needs to build
        if (constructionSite != null) {
            this.setCreepMemory("canDo", true);
            //If not in range to build, move to destination
            if (this.creep.build(constructionSite) == ERR_NOT_IN_RANGE)
                this.moveTo(constructionSite)
        } else  //Setting canDo to false because the creep has not job
            this.setCreepMemory("canDo", false);
    }
};

module.exports = Engineer;