global.presets = require("presets");
var room = require("room");

global.jobs = {
    ai:require("ai"),
    melee: null,
    ranged: null,
    engineer: null,
    medic: null,
    harvest:null,
    research: null,
    merchant: null,
    scout: null
};
global.tasks = {
    collect: require("task.collect"),
    build: require("task.build"),
    harvest: require("task.harvest"),
    repair: require("task.repair"),
    transfer: require("task.transfer"),
    transfer_close: require("task.transfer_close"),
    supply: require("task.supply"),
    upgrade: require("task.upgrade")
};
module.exports.loop = function () {
    //console.log("-----------------------ROOMS-----------------------");
    //Looping trough rooms
    for (let r in Game.rooms) {
        //Runnig room's script
        let ro = room(r);
    }
    //console.log("---------------------------------------------------");
    //console.log("-----------------------CREEPS----------------------");

    for (let c in Game.creeps) {
        let creep = Game.creeps[c];
        let instance = jobs[creep.memory.main_job] != null?jobs[creep.memory.main_job]:jobs.ai;
        let cr = new instance(creep);
        cr.run();
    }

    Memory.reloadTasks = false;
   //console.log("---------------------------------------------------");
};