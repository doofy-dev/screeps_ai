//Creep logic

function AI(creep) {
    this.creep = creep;

    this.memory = {
        working: false,
        mainJob: null,
        currentJob: null,
        destination: null,
        path: null,
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
            this.creep.moveTo(dst);
            // this.creep.moveByPath(this.memory.path);
        }
    // if (this.creep.harvest(this.memory.destination) == ERR_NOT_IN_RANGE) {
    //     this.creep.moveTo(source);
    }
};
AI.prototype.run = function () {
    let creep = this.creep;


    if (creep.carry.energy == 0 && creep.memory.working && this.memory.needCollect) {
            this.setDestination(null);
            creep.memory.working = false;

    } else {
        if (!creep.memory.working && creep.carry.energy == creep.carryCapacity) {
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