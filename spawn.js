/**
 * Created by teeebor on 2016-07-14.
 */

module.exports = function (spawner) {
    //Body part costs (From docs)
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

    //Getting creep information from room memory
    var creeps = spawner.room.memory.states.creeps;

    var required = [];
    //Ordering creeps by importance
    for (let c in creeps) {
        required[creeps[c].priority] = [c, creeps[c]];
    }
    //Getting all available energy
    var roomEnergy = spawner.room.energyAvailable;
    //Getting the room's energy capacity
    var roomEnergyCapacity = spawner.room.energyCapacityAvailable;
    //looping trough the ordered required list
    for (let c in required) {
        let creep = required[c][1];
        let key = required[c][0];
        //If can and need to spawn
        if ((creep.count < creep.required && roomEnergyCapacity == roomEnergy) ||
            (creep.count < creep.initial && hasEnoughEnergy(Memory.jobs[key].parts, roomEnergy))
        ) {
            console.log("trying to spawn: ", key);
            let job = key;
            //Retrieving parts prefab from the job settings (main.js)
            var fromParts = Memory.jobs[job].parts;
            //Getting the best parts
            var parts = getBestParts(roomEnergy, fromParts);
            //Creating creep
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
        //pushing parts
        for (let i = 0; i < parts.length; i++)
            for (let j = 0; j < number; j++)
                r.push(parts[i])
        requiredEnergy = energyRequired(r);
        let has = false;
        //Trying to use the rest of the energy
        do{
            has=false;
            let add = null;
            for(let i=0; i<parts.length;i++) {
                if (requiredEnergy + bodyPartCost[parts[i]] <= energy) {
                    r.push(parts[i]);
                    if(add==null || bodyPartCost[add]<bodyPartCost[parts[i]]){
                        add = parts[i];
                    }
                }
            }
            if(add!=null){
                has = true;
                requiredEnergy +=bodyPartCost[add];
            }
        }while (has);
        //returning the parts
        return r;
    }
    //Energy required for the parts
    function energyRequired(parts) {
        let energy = 0;
        for (let i = 0; i < parts.length; i++)
            energy += bodyPartCost[parts[i]];
        return energy;
    }

    //Has enough energy for the parts
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