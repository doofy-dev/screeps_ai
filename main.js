var ai = require("ai");
var room = require("room");
var jobs={
    melee: require('ai.melee'),
    ranged: require('ai.ranged'),
    harvest: require('ai.harvest'),
    engineer: require('ai.engineer'),
    medic: require('ai.medic'),
    research: require('ai.research')
};

module.exports.loop = function () {
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

    for(let r in Game.rooms){
        let ro = room(r);

    }

    for(let c in Memory.creeps){
        let creep = Game.creeps[c];
        if(Memory.killAll) {
            creep.suicide();
            delete Memory.creeps[c];
        }else{
            if(!Game.creeps[c]) {
                delete Memory.creeps[c];
            }else{
                var job = typeof creep.memory.currentJob == "undefined" || creep.memory.currentJob == null? creep.memory.mainJob:creep.memory.currentJob;
                if(typeof jobs[job]!="undefined")
                    var cr = new jobs[job](creep);
                cr.run();
            }
        }
    }
    Memory.killAll = false;

};