/**
 * Created by teeebor on 2016-07-15.
 */
var AI = require('ai');
function Research(creep) {
    this.base = AI;
    this.base(creep);
}
Research.prototype = Object.create(AI.prototype);
Research.prototype.constructor = Research;
Research.prototype.doJob = function(){
    if (this.creep.upgradeController(this.creep.room.controller) == ERR_NOT_IN_RANGE)
        this.creep.moveTo(this.creep.room.controller);
};

module.exports = Research;