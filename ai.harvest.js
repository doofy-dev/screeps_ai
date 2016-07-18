/**
 * Created by teeebor on 2016-07-15.
 */
//Extending AI
var AI = require('ai');
function Harvest(creep) {
    this.base = AI;
    this.base(creep);
}
Harvest.prototype = Object.create(AI.prototype);
Harvest.prototype.constructor = Harvest;
//Override: AI.doJob
Harvest.prototype.doJob = function () {
    //Getting destination
    var dest = Game.getObjectById(this.memory.destination);   //If has structure
    if (this.memory.destination == null || dest.energy == dest.energyCapacity) {
        console.log("if")
        //List spawns with not maximum energy
        let spawn = this.getSpawns();
        //List extensions with not maximum energy
        let ext = this.findStructure(STRUCTURE_EXTENSION);
        //If has spawn
        if(spawn!=null) {
            console.log("spawn");
            this.setDestination(spawn.id);
        }
        else {
            console.log("extension");
            //If has extension
            if (ext != null)
                this.setDestination(ext.id);
            else { //Setting setDestination to null because the creep has not job
                console.log("set to false");
                this.setDestination(null);
                this.setCreepMemory("canDo", false);
                //break execution
                return;
            }
        }
    }
    this.setCreepMemory("canDo", true);

    //If not in range to transfer, move to destination
    if (this.creep.transfer(Game.getObjectById(this.memory.destination), RESOURCE_ENERGY) == ERR_NOT_IN_RANGE)
        this.moveTo(Game.getObjectById(this.memory.destination));
};
//Find structure by type
Harvest.prototype.findStructure = function (structure) {
    return this.creep.pos.findClosestByPath(FIND_MY_STRUCTURES,
        {
            filter: function(object) {
                return object.structureType == structure && object.energy<object.energyCapacity;
            }
        });
};
//Find all spawns in the room
Harvest.prototype.getSpawns = function () {
    var spawns = this.creep.room.find(FIND_MY_SPAWNS);
    for(let i=0;i<spawns.length;i++){
        if(spawns[i].energy<spawns[i].energyCapacity)
            return spawns[i]
    }
    return null;
};
module.exports = Harvest;