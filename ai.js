//Creep logic

function AI(creep) {
    this.creep = creep;

    this.memory = {
        working: false,
        mainJob: null,
        currentJob: null,
        destination: null,
        path: {id:null, path:null,index:0},
        needCollect: true,
        canDo:true
    };

    this.roomMemory = {
        buildTask: null,
        repairTask: null,
        attackTarget: null,
        upgradeTask: null
    };
    this.sourceMap = {};
    Object.assign(this.roomMemory, creep.room.memory.tasks);
    Object.assign(this.sourceMap, creep.room.memory.sources);
    Object.assign(this.memory, creep.memory);
}

AI.prototype.doJob = function () {};
AI.prototype.canDoJob = function () {return this.memory.canDo;};
AI.prototype.setDestination = function (dest) {
    if(dest!= null && typeof this.sourceMap[dest]!="undefined")
        this.creep.room.memory.sources[dest].allocated++;
    if(dest==null && this.memory.destination != null && typeof this.sourceMap[this.memory.destination]!="undefined")
        this.creep.room.memory.sources[this.memory.destination].allocated--;
    this.setCreepMemory("destination",dest);
};
AI.prototype.moveTo=function (destination,reload=false) {
    var path = {};
    Object.assign(path, this.memory.path);
    let cPos = this.getRoomPos(this.creep,this.creep.room.name);
    let dPos = this.getRoomPos(destination,this.creep.room.name);
    if(path.id != destination.id || path.path==null){
        path.id=destination.id;
        path.path = cPos.findPathTo(dPos);
        path.index = 0;
    }
    let nextMove=path.path[path.index];
    if(path.path==null || path.index==path.path.length || !this.canMove(cPos,nextMove.direction,this.creep.room) || (cPos.x == dPos.x && cPos.y == dPos.y)){
        this.setCreepMemory('path',{id:null, path:null,index:0});
        if(reload)
            this.moveTo(destination,true);
        return false;
    }else{
        if(this.creep.move(nextMove.direction)==OK)
          path.index++;
    }
    
    this.setCreepMemory('path',path);
};

AI.prototype.canMove=function (pos, direction, room) {
    // const TOP = 1;
    // const TOP_RIGHT = 2;
    // const RIGHT = 3;
    // const BOTTOM_RIGHT = 4;
    // const BOTTOM = 5;
    // const BOTTOM_LEFT = 6;
    // const LEFT = 7;
    // const TOP_LEFT = 8;
    let creeps = pos.findInRange(pos,1,FIND_MY_CREEPS);
    let dirs = {
        1:{x:0,y:1},
        2:{x:1,y:1},
        3:{x:1,y:0},
        4:{x:1,y:-1},
        5:{x:0,y:-1},
        6:{x:-1,y:-1},
        7:{x:-1,y:0},
        8:{x:-1,y:1}
    };
    let x = pos.x + dirs[direction].x;
    let y = pos.y + dirs[direction].y;
    for(var c in creeps){
        let creep = creeps[c];
        console.log('has? ',x,y);
        if(creep.pos.x == x && creep.pos.y == y)
            return false;
    }
    return true;
};

AI.prototype.getRoomPos = function (object,roomName) {
  return Game.rooms[roomName].getPositionAt(object.pos.x,object.pos.y);
};
AI.prototype.collect = function () {
    if(this.memory.destination == null){
        var sources = this.creep.room.find(FIND_SOURCES);
        for (let s in sources) {
            let source = sources[s];
            let map = this.sourceMap[source.id];
            if(map.allocated<map.entries){
                this.setDestination(source.id);
                break;
            }
        }
    }
    if(this.memory.destination!=null){
        let dst=Game.getObjectById(this.memory.destination);
        if (this.creep.harvest(dst) == ERR_NOT_IN_RANGE) {
            this.moveTo(dst);
        }
    // if (this.creep.harvest(this.memory.destination) == ERR_NOT_IN_RANGE) {
    //     this.creep.moveTo(source);
    }
};
AI.prototype.run = function () {
    let creep = this.creep;
    let minimumTTL = 30;
    if(creep.ticksToLive < minimumTTL) {
        creep.memory.working = true;
        this.setDestination(null);
    }
    if (creep.carry.energy == 0 && creep.memory.working && this.memory.needCollect && creep.ticksToLive>=minimumTTL) {
            this.setDestination(null);
            creep.memory.working = false;

    } else {
        if (!creep.memory.working && (creep.carry.energy == creep.carryCapacity || creep.ticksToLive<minimumTTL)) {
            this.setDestination(null);
            creep.memory.working = true;
        }
    }
    if(this.memory.currentJob == null){
        this.setCreepMemory('currentJob',this.memory.mainJob);
    }
    let secondary =Memory.jobs[this.memory.mainJob].secondary_job;

    if(!this.canDoJob() && secondary!=null && Memory.jobs[this.memory.mainJob].secondary_job != this.memory.currentJob) {
        this.setCreepMemory('currentJob', Memory.jobs[this.memory.mainJob].secondary_job);
    }
    if(this.memory.currentJob != this.memory.mainJob && !this.memory.working)
        this.setCreepMemory('currentJob', this.memory.mainJob);
    if(creep.memory.working || !this.memory.needCollect)
        this.doJob();
    else
        this.collect();
};
AI.prototype.setCreepMemory = function (key,value) {
    this.memory[key] = value;
    this.creep.memory[key] = value;
};
module.exports = AI;