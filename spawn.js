/**
 * Created by teeebor on 2016-07-20.
 */
module.exports = function (spawn) {
    let jobs = presets.jobs;
    let required = [];
    let roomEnergy = spawn.room.energyAvailable;
    let roomCapacity = spawn.room.energyCapacityAvailable;
    
    for(let j in jobs)
        required[jobs[j].priority] = j;
    for(let i in required){
        let j = required[i];
        if(typeof j!= "undefined" && j!=null){
            let job = jobs[j];
            if(((job.count<job.initial && hasEnoughEnergy(job.parts)) ||
                (job.count<job.required && roomEnergy==roomCapacity)) && job.spawnCondition(spawn.room)){
                let parts = getBestParts(job.parts);
                var name = spawn.createCreep(parts,undefined,{main_job:j});
                if(!(name<0) && typeof name!="undefined"){
                    console.log('spawning',name,'as',j);
                }
                break;
            }
        }
    }
    
    function getBestParts(parts) {
        var r = [];
        var requiredEnergy = energyRequired(parts);
        var number = Math.floor(roomEnergy / requiredEnergy);
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
                if (requiredEnergy + presets.bodyPartCost[parts[i]] <= roomEnergy) {
                    if(presets.bodyPartCost[add]<presets.bodyPartCost[parts[i]]){
                        add = parts[i];
                    }
                }
            }
            if(add!=null){
                r.push(add);
                has = true;
                requiredEnergy +=presets.bodyPartCost[add];
            }
        }while (has);
        //returning the parts
        return r;
    }
    function energyRequired(parts) {
        let energy = 0;
        for (let i = 0; i < parts.length; i++)
            energy += presets.bodyPartCost[parts[i]];
        return energy;
    }
    
    function hasEnoughEnergy(parts) {
        return roomEnergy >= energyRequired(parts)
    }
};