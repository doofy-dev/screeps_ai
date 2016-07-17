/**
 * Created by teeebor on 2016-07-15.
 */
var AI = require('ai');
function Medic(creep) {
    this.base = AI;
    this.base(creep);
}
Medic.prototype = Object.create(AI.prototype);
Medic.prototype.constructor = Medic;
Medic.prototype.doJob = function(){
        this.setCreepMemory("canDo", false);
};

module.exports = Medic;