/**
 * Created by teeebor on 2016-07-15.
 */
var AI = require('ai');
function Harvest(creep) {
    this.base = AI;
    this.base(creep);
}
Harvest.prototype = Object.create(AI.prototype);
Harvest.prototype.constructor = Harvest;
Harvest.prototype.doJob = function () {
    var dest = Game.getObjectById(this.memory.destination);
    if (this.memory.destination == null || dest.energy == dest.energyCapacity) {
        console.log("if")
        let spawn = this.getSpawns();
        let ext = this.findStructure(STRUCTURE_EXTENSION);
        if(spawn!=null) {
            console.log("spawn");
            this.setDestination(spawn.id);
        }
        else {
            console.log("extension");
            if (ext != null)
                this.setDestination(ext.id);
            else {
                console.log("set to false");
                this.setDestination(null);
                this.setCreepMemory("canDo", false);
                return;
            }
        }
    }
    this.setCreepMemory("canDo", true);
    if (this.creep.transfer(Game.getObjectById(this.memory.destination), RESOURCE_ENERGY) == ERR_NOT_IN_RANGE)
        this.moveTo(Game.getObjectById(this.memory.destination));
};

Harvest.prototype.findStructure = function (structure) {
    return this.creep.pos.findClosestByPath(FIND_MY_STRUCTURES,
        {
            filter: function(object) {
                return object.structureType == structure && object.energy<object.energyCapacity;
            }
        });
};
Harvest.prototype.getSpawns = function () {
    var spawns = this.creep.room.find(FIND_MY_SPAWNS);
    for(let i=0;i<spawns.length;i++){
        if(spawns[i].energy<spawns[i].energyCapacity)
            return spawns[i]
    }
    return null;
};
module.exports = Harvest;