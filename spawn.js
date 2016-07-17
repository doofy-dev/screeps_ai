/**
 * Created by teeebor on 2016-07-14.
 */

module.exports = function (spawner) {
    var bodyPartCost = {
        move: 80,
        work: 100,
        carry: 50,
        attack: 80,
        ranged_attack: 150,
        heal: 250,
        claim: 600,
        tough: 10
    };

    var creeps = spawner.room.memory.states.creeps;

    var required = [];

    for (let c in creeps) {
        required[creeps[c].priority] = [c, creeps[c]];
    }
    var roomEnergy = spawner.room.energyAvailable;
    var roomEnergyCapacity = spawner.room.energyCapacityAvailable;
    for (let c in required) {
        let creep = required[c][1];
        let key = required[c][0];
        if ((creep.count < creep.required && roomEnergyCapacity == roomEnergy) ||
            (creep.count < creep.initial && hasEnoughEnergy(Memory.jobs[key].parts, roomEnergy))
        ) {
            console.log("trying to spawn: ", key);
            let job = key;
            var fromParts = Memory.jobs[job].parts;
            var parts = getBestParts(roomEnergy, fromParts);
            var name = spawner.createCreep(parts, undefined, {mainJob: job});
            if (!(name < 0) && typeof name != 'undefined')
                console.log("spawned: " + name + ' job: ' + job);
            break;
        }
    }

    function getBestParts(energy, parts) {
        var r = [];
        var requiredEnergy = energyRequired(parts);
        var number = Math.floor(energy / requiredEnergy);
        for (let i = 0; i < parts.length; i++)
            for (let j = 0; j < number; j++)
                r.push(parts[i])
        requiredEnergy = energyRequired(r);
        let has = false;
        do{
            has=false;
            for(let i=0; i<parts.length;i++) {
                if (requiredEnergy + bodyPartCost[parts[i]] <= energy) {
                    r.push(parts[i]);
                    requiredEnergy +=bodyPartCost[parts[i]];
                    has = true;
                }
            }
        }while (has);

        return r;
    }

    function energyRequired(parts) {
        let energy = 0;
        for (let i = 0; i < parts.length; i++)
            energy += bodyPartCost[parts[i]];
        return energy;
    }

    function hasEnoughEnergy(parts, energy) {
        return energy >= energyRequired(parts)
    }

    function getHighest(parts) {
        let h = 0;
        for (let i = 0; i < parts.length; i++)
            if (bodyPartCost[parts[i]] < h)
                h = bodyPartCost[parts[i]];
        return h;
    }
};