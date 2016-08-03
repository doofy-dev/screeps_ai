/**
 * Created by teeebor on 2016-07-20.
 */

function AI(creep) {
    this.creep = creep;
    this.memory = {};
    //setting up memory preset
    Object.assign(this.memory, presets.creep);
    //loading memory
    Object.assign(this.memory, creep.memory);

    this.direction = presets.direction;
}
AI.prototype.constructor = AI;

AI.prototype.move = function (reload = false) {
    if (this.getDestination() != null) {
        let nextMove = this.memory.destination.path[this.memory.destination.index];
        let canMove = this.memory.destination.index < this.memory.destination.path.length && this.canMove(this.creep.pos, nextMove.direction);
        // let cm=typeof nextMove != "undefined"?this.canMove(this.creep.pos,nextMove.direction):false;
        //  if (canMove) {
        //   var m=this.creep.moveByPath(this.memory.destination.path);
        var m = typeof nextMove != "undefined" ? this.creep.move(nextMove.direction) : ERR_NO_PATH;
        //console.log('move', m)
        if (m == OK) {
            // let terrainAt=Game.map.getTerrainAt(nextMove.x, nextMove.y, this.creep.room.name);
            // if(terrainAt!=STRUCTURE_ROAD)
            //     this.creep.room.createConstructionSite(nextMove.x, nextMove.y,STRUCTURE_ROAD);
            //console.log('increasing index',this.memory.destination.index);
            this.memory.destination.index++;
            this.setCreepMemory('destination',this.memory.destination);
            return true;
        }
        else {
            if(this.getDestination()!= null)
            if (!m || (m!=ERR_TIRED && !reload)) {
                this.setDestination(this.memory.destination.id, true);
                this.move(true);
            }
        }
        //  }
        //   if (!canMove && this.memory.destination.index != this.memory.destination.path.length) {
        //
        //   }
    }
    return false;
};

AI.prototype.canMove = function (pos, direction) {
    if(typeof direction == "undefined")
        return false;
    let creeps = pos.findInRange(pos, 1, FIND_MY_CREEPS);
    let x = pos.x + presets.direction[direction].x;
    let y = pos.y + presets.direction[direction].y;
    for (var c in creeps) {
        let creep = creeps[c];
        if (creep.pos.x == x && creep.pos.y == y)
            return false;
    }
    return true;
};

AI.prototype.setDestination = function (destination, reload = false) {
    let prevDest=null;
    if(this.getDestination()!=null)
        prevDest =this.memory.destination.id;

    if ((prevDest != destination) || reload) {

        if (prevDest != null && this.isSource(prevDest)) {
            this.creep.room.memory.sources[prevDest].allocated--;
        }
        else {
            if (this.isSource(destination))
                this.creep.room.memory.sources[destination].allocated++;
        }
        if (destination != null) {
            let cPos = this.getRoomPos(this.creep, this.creep.room.name);
            let dPos = this.getRoomPos(Game.getObjectById(destination), this.creep.room.name);
            this.setCreepMemory('destination', {
                id: destination,
                path: cPos.findPathTo(dPos),
                index: 0,
            })
        } else {
            this.setCreepMemory('destination', presets.creep.destination)
        }
    }
};

AI.prototype.isType = function (ID, type) {
    return Game.getObjectById(ID).structureType == type;
};
AI.prototype.isSource = function (ID) {
    return typeof this.creep.room.memory.sources[ID] != "undefined";
};

AI.prototype.getFreeSource = function () {
    for (let s in this.creep.room.memory.sources) {
        let source = this.creep.room.memory.sources[s];
        let count = this.creep.room.find(FIND_MY_CREEPS,{
            filter:(creep)=>typeof creep.memory.destination!= "undefined" && creep.memory.destination.id==s
        }).length;
        //console.log('getfree',count)
        if (count != source.entries) {
            return Game.getObjectById(s);
        }
    }
    return null;
};

AI.prototype.run = function () {
    //console.log(this.creep.name, 'start');
    let myTasks = presets.jobs[this.memory.main_job].tasks;
    let task;
    //console.log(this.memory.task)
    if (this.memory.task == null) {
        task = this.changeTask(myTasks);
        //console.log("task", task)
        if (task != null)
            task.search();
    }
    else
        task = new tasks[this.memory.task](this);
    if(Memory.reloadTasks || this.getDestination()==null)
        task.search();
    if (task != null && task.canDo())
        task.do();
    else {
        task = this.changeTask(myTasks);
        if (task != null)
            task.search();
    }
    //console.log(this.creep.memory.task, task.canDo())
    //console.log()
};

AI.prototype.changeTask = function (myTasks) {
    for (let t in myTasks) {
        //console.log('checking', myTasks[t])
        let task = new tasks[myTasks[t]](this);
        //console.log(myTasks[t], task.canDo())
        if (task.canDo()) {
            this.say(myTasks[t]);
            this.setCreepMemory('task', myTasks[t]);
            return task;
        }
    }
    return null;
};

//Getting RoomPosition instance for the object
AI.prototype.getRoomPos = function (object, roomName) {
    return Game.rooms[roomName].getPositionAt(object.pos.x, object.pos.y);
};
AI.prototype.say = function (message) {
    this.creep.say(message);
};

AI.prototype.setCreepMemory = function (key, value) {
    this.memory[key] = value;
    this.creep.memory[key] = value;
};

AI.prototype.findStructure = function (structure,type=RESOURCE_ENERGY) {
    var method = structure!=STRUCTURE_CONTAINER?(object)=>object.energy < object.energyCapacity:(object)=>object.store[type]<object.storeCapacity;
    return this.creep.pos.findClosestByPath(FIND_MY_STRUCTURES,
        {
            filter: function (object) {
                return object.structureType == structure && (method(object));
            }
        });
};
AI.prototype.findBy = function (structure, filter, findBy = FIND_MY_STRUCTURES) {
    return this.creep.pos.findClosestByPath(findBy,{
        filter:function (object) {
            return object.structureType == structure && filter(object)
        }
    })
}
AI.prototype.findClosestByTypes = function (structures) {
    for (let s in structures) {
        let str = this.findStructure(structures[s]);
        if (str != null) {
            return str;
        }
    }
    return null;
};

AI.prototype.withTypes = function (structure, types) {
    if (structure != null)
        for (let t in types) {
            if (structure.structureType == types[t])
                return true;
        }
    return false;
};
AI.prototype.getDestination=function(){
    if(typeof this.memory.destination!= "undefined" && this.memory.destination!=null)
        return Game.getObjectById(this.memory.destination.id);
    return null;
};

module.exports = AI;