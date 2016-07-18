//Creep logic
//Base AI script
function AI(creep) {
    this.creep = creep;
    //Initial memory
    this.memory = {
        working: false,
        mainJob: null,
        currentJob: null,
        destination: null,
        path: {id: null, path: null, index: 0},
        needCollect: true,
        canDo: true
    };

    //Initial room memory
    this.roomMemory = {
        buildTask: null,
        repairTask: null,
        attackTarget: null,
        upgradeTask: null
    };

    //Energy source list
    this.sourceMap = {};

    //cloning memory into the properies
    Object.assign(this.roomMemory, creep.room.memory.tasks);
    Object.assign(this.sourceMap, creep.room.memory.sources);
    Object.assign(this.memory, creep.memory);
}

//Abstract method (when the creep can do the job)
AI.prototype.doJob = function () {
};
//If the creep can do the job
AI.prototype.canDoJob = function () {
    return this.memory.canDo;
};

//Setting the destination and reserving or releasing allocated points to the source
AI.prototype.setDestination = function (dest) {
    if (dest != null && typeof this.sourceMap[dest] != "undefined")
        this.creep.room.memory.sources[dest].allocated++;
    if (dest == null && this.memory.destination != null && typeof this.sourceMap[this.memory.destination] != "undefined")
        this.creep.room.memory.sources[this.memory.destination].allocated--;
    this.setCreepMemory("destination", dest);
};

//Custom move method
AI.prototype.moveTo = function (destination, reload = false) {
    var path = {};
    Object.assign(path, this.memory.path);
    //Getting RoomPosition objects
    let cPos = this.getRoomPos(this.creep, this.creep.room.name);
    let dPos = this.getRoomPos(destination, this.creep.room.name);
    //If there is no path saved to the destination
    if (path.id != destination.id || path.path == null) {
        path.id = destination.id;
        //Finding path to destination
        path.path = cPos.findPathTo(dPos);
        path.index = 0;
    }
    //Getting next path node
    let nextMove = path.path[path.index];
    //If can move
    var canMove = path.index == path.path.length?true:this.canMove(cPos, nextMove.direction, this.creep.room);
    //If the creep can or need to move
    if (path.path == null || path.index == path.path.length ||
        !canMove || (cPos.x == dPos.x && cPos.y == dPos.y)) {
        //Releasing memory
        this.setCreepMemory('path', {id: null, path: null, index: 0});
        //If there is a creep in the way, reloading the path
        if (!canMove && !reload)
            this.moveTo(destination, true);
        return false;
    } else {
        //If the creep moved, increasing the path node index
        if (this.creep.move(nextMove.direction) == OK)
            path.index++;
    }
    //Updating the path memory
    this.setCreepMemory('path', path);
};

//Can move method (there is a creep in the way)
AI.prototype.canMove = function (pos, direction, room) {
    let creeps = pos.findInRange(pos, 1, FIND_MY_CREEPS);
    let dirs = {
        1: {x: 0, y: 1}, //TOP
        2: {x: 1, y: 1}, //TOP-RIGHT
        3: {x: 1, y: 0}, //RIGHT
        4: {x: 1, y: -1},//BOTTOM-RIGHT
        5: {x: 0, y: -1}, //BOTTOM
        6: {x: -1, y: -1}, //BOTTOM-LEFT
        7: {x: -1, y: 0}, //LEFT
        8: {x: -1, y: 1} //TOP-LEFT
    };
    let x = pos.x + dirs[direction].x;
    let y = pos.y + dirs[direction].y;
    for (var c in creeps) {
        let creep = creeps[c];
        console.log('has? ', x, y);
        if (creep.pos.x == x && creep.pos.y == y)
            return false;
    }
    return true;
};
//Getting RoomPosition instance for the object
AI.prototype.getRoomPos = function (object, roomName) {
    return Game.rooms[roomName].getPositionAt(object.pos.x, object.pos.y);
};
//Collecting resource
AI.prototype.collect = function () {
    //If there is no destination
    if (this.memory.destination == null) {
        var sources = this.creep.room.find(FIND_SOURCES);
        for (let s in sources) {
            let source = sources[s];
            let map = this.sourceMap[source.id];
            //If source has free entry
            if (map.allocated < map.entries) {
                this.setDestination(source.id);
                break;
            }
        }
    }
    //If there is a destination
    if (this.memory.destination != null) {
        //Get destination object
        let dst = Game.getObjectById(this.memory.destination);
        //If the source is out of range
        if (this.creep.harvest(dst) == ERR_NOT_IN_RANGE) {
            //move to source
            this.moveTo(dst);
        }
    }/*else{
        this.setDestination(this.creep.room.spawns[Object.keys(this.creep.room.spawns)[0]]);
    }*/
};

//Creep entry point
AI.prototype.run = function () {
    let creep = this.creep;
    //Minimum timeToLeave before die
    let minimumTTL = 30;
    //If creep is going to die, leave the source
    if (creep.ticksToLive < minimumTTL) {
        creep.memory.working = true;
        this.setDestination(null);
    }
    //If creep needs to collect energy
    if (creep.carry.energy == 0 && creep.memory.working && this.memory.needCollect && creep.ticksToLive >= minimumTTL) {
        this.setDestination(null);
        creep.memory.working = false;

    } else {
        //If creep collected the maximum amount of energy
        if (!creep.memory.working && (creep.carry.energy == creep.carryCapacity || creep.ticksToLive < minimumTTL)) {
            this.setDestination(null);
            creep.memory.working = true;
        }
    }
    //If current job is null set to main job
    if (this.memory.currentJob == null) {
        this.setCreepMemory('currentJob', this.memory.mainJob);
    }
    //get secondary job
    let secondary = Memory.jobs[this.memory.mainJob].secondary_job;

    //if can not do the main job, trying to set the secondary job
    if (!this.canDoJob() && secondary != null && Memory.jobs[this.memory.mainJob].secondary_job != this.memory.currentJob) {
        this.setCreepMemory('currentJob', Memory.jobs[this.memory.mainJob].secondary_job);
    }
    //If the creep is collecting energy, resetting the current job to the main
    if (this.memory.currentJob != this.memory.mainJob && !this.memory.working)
        this.setCreepMemory('currentJob', this.memory.mainJob);
    //If creep can work, do its job
    if (creep.memory.working || !this.memory.needCollect)
        this.doJob();
    else    //collect resource
        this.collect();
};
//Setting creep memory and instance prototype at once
AI.prototype.setCreepMemory = function (key, value) {
    this.memory[key] = value;
    this.creep.memory[key] = value;
};
//Returning class
module.exports = AI;