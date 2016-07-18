//Loading main AI
var ai = require("ai");
//Loading Room code
var room = require("room");
//Loading jobs
var jobs={
    melee: require('ai.melee'),
    ranged: require('ai.ranged'),
    harvest: require('ai.harvest'),
    engineer: require('ai.engineer'),
    medic: require('ai.medic'),
    research: require('ai.research')
};

//Tick entry point
module.exports.loop = function () {
    //Setting up job settings
    if(typeof Memory.jobs == 'undefined' || Memory.jobs == null){
        Memory.jobs = {
            melee: {
                parts: [MOVE, ATTACK, TOUGH, CLAIM],
                secondary_job: null
            },
            ranged: {
                parts: [MOVE, RANGED_ATTACK, CLAIM],
                secondary_job: null
            },
            harvest: {
                parts: [MOVE, WORK, CARRY],
                secondary_job: 'research'
            },
            engineer: {
                parts: [MOVE, WORK, CARRY],
                secondary_job: 'research'
            },
            medic: {
                parts: [MOVE, HEAL],
                secondary_job: null
            },
            research: {
                parts: [MOVE, WORK, CARRY],
                secondary_job: null
            }
        };
    }

    //Looping trough rooms
    for(let r in Game.rooms){
        //Runnig room's script
        let ro = room(r);
    }

    //Looping trough creeps
    for(let c in Memory.creeps){
        let creep = Game.creeps[c];
        //If the user wants to kill them all
        if(Memory.killAll) {
            creep.suicide();
            delete Memory.creeps[c];
        }else{
            //If the creep is dead, releasing memory
            if(!Game.creeps[c]) {
                delete Memory.creeps[c];
            }else{
                //Deciding what to do (primary or current job)
                var job = typeof creep.memory.currentJob == "undefined" || creep.memory.currentJob == null? creep.memory.mainJob:creep.memory.currentJob;
                //If the job is correct, run the script for it
                if(typeof jobs[job]!="undefined"){
                    var cr = new jobs[job](creep);
                    cr.run();
                }
            }
        }
    }
    Memory.killAll = false;

};