/**
 * Created by teeebor on 2016-07-20.
 */

var spawn = require("spawn")

module.exports = function (room) {
    let roomObject = Game.rooms[room];
    if (typeof roomObject.memory.level == "undefined" || roomObject.memory.last_update + presets.update_frequency < Game.time) {
        initMemory();
    }
    countCreeps();
    checkBuildTask();
    checkRepairTask();
    checkEnemy();
    spawner();

    function spawner() {
        let spawns = roomObject.find(FIND_MY_SPAWNS, {
            filter: function (object) {
                return object.room.id == roomObject.id;
            }
        });
        for (let s in spawns) {
            let sp = spawns[s];
            spawn(sp);
        }
    }

    function initMemory() {
        placeStructure();
        console.log("Reloading memory");
        let roomType = null;
        for (let t in presets.room_type) {
            if (presets.room_type[t](roomObject))
                roomType = t;
        }
        let level = null;
        for (let t in presets.roomPhases) {
            console.log("checking level",t)
            if (presets.roomPhases[t](roomObject)) {
                console.log("level",t)
                level = t;
            }
        }
        Object.assign(presets.roomMemory.task, roomObject.memory.task);
        roomObject.memory = {
            level: level,
            jobs: {}
        };
        Object.assign(roomObject.memory, presets.roomMemory);
        roomObject.memory.level=level;
        //@TODO: required?
        for (let j in presets.jobs) {
            let job = presets.jobs[j];
            roomObject.memory.jobs[j] = {
                initial: job.initial,
                required: job.required,
                priority: job.priority,
            };
        }
        var sources = roomObject.find(FIND_SOURCES);

        for (let s in sources) {
            let source = sources[s];
            roomObject.memory.sources[source.id] = {
                entries: getEntries(source)
            }
        }

        roomObject.memory.last_update = Game.time;
    }

    function getEntries(source) {
        let posX = source.pos.x;
        let posY = source.pos.y;
        let count = 0;
        for (let i = -1; i < 2; i++) {
            for (let j = -1; j < 2; j++) {
                var terrain = Game.map.getTerrainAt(posX + i, posY + j, room);
                if (terrain == "swamp" || terrain == "plain" || terrain == "road")
                    count++;
            }
        }
        return count;
    }

    function placeStructure() {
        if(roomObject.find(FIND_CONSTRUCTION_SITES,{
                filter: function (object) {
                    return object.my ;
                }
            }).length<presets.minimum_construction_site){
            let count = 0;
            console.log('placing start')
            let spawns = roomObject.find(FIND_MY_SPAWNS, {
                filter: function (object) {
                    return object.my;
                }
            });
            for(let s in spawns){
                let spawn = spawns[s];
                let pos1 = roomObject.getPositionAt(spawn.pos.x,spawn.pos.y);
                for(let source in roomObject.memory.sources){
                    let obj = Game.getObjectById(source);
                    if(obj!=null){
                        let pos2 = roomObject.getPositionAt(obj.pos.x,obj.pos.y);
                        let path = pos1.findPathTo(pos2);
                        for(let pa in path){
                            let p=path[pa];
                            if(Game.map.getTerrainAt(p.x, p.y, room)!=STRUCTURE_ROAD){
                                console.log('placing',STRUCTURE_ROAD,p.x,p.y)
                                if(roomObject.createConstructionSite(p.x,p.y,STRUCTURE_ROAD)==OK)
                                    count++;
                                if(count>=presets.place_construction_site)
                                    return;
                            }
                        }
                    }
                }
            }
            console.log('placing end')
        }
    }

    function countCreeps() {
        for (let c in presets.jobs) {
            presets.jobs[c].count = _.filter(Game.creeps, function (creep) {
                return creep.room.id == roomObject.id && creep.memory.main_job == c && creep.ticksToLive > presets.minimumTimeToLive;
            }).length
        }
    }

    function checkBuildTask() {
        if (roomObject.memory.task.build != null) {
            var cs = Game.getObjectById(roomObject.memory.task.build);
            if (cs != null) {
                if (cs.progress == cs.progressTotal)
                    roomObject.memory.task.build = null;
            }
            else
                roomObject.memory.task.build = null;
        }
        if (roomObject.memory.task.build == null) {
            var sites = [];
            var constructionSites = roomObject.find(FIND_MY_CONSTRUCTION_SITES);
            for (let cs in constructionSites) {
                let constructionSite = constructionSites[cs];
                if (constructionSite != null && constructionSite.progress < constructionSite.progressTotal)
                    sites.push(constructionSite);
            }
            //@TODO: prioritize build tasks
            for (let i = 0; i < sites.length; i++) {
                let pos = sites[i].pos;
                if (Game.map.getTerrainAt(pos.x, pos.y, room) == "swamp") {
                    roomObject.memory.task.build = sites[i].id;
                }
            }
            if (roomObject.memory.task.build == null && sites.length > 0) {
                roomObject.memory.task.build = sites[0].id;
            }
        }
    }

    function checkRepairTask() {
        if (roomObject.memory.task.repair != null) {
            var cs = Game.getObjectById(roomObject.memory.task.repair);
            if (cs != null) {
                if (presets.repair_done(cs))
                    roomObject.memory.task.repair = null;
            }
            else
                roomObject.memory.task.repair = null;
        }
        if (roomObject.memory.task.repair == null) {

            var repairs = roomObject.find(FIND_STRUCTURES,
                {
                    filter: function (object) {
                        return presets.repair_condition(object);
                    }
                });
            //@TODO: prioritize repair tasks
            if (roomObject.memory.task.repair == null && repairs.length > 0)
                roomObject.memory.task.repair = repairs[0].id;
        }
    }

    function checkEnemy() {
        if (roomObject.memory.task.attack != null) {
            let enemy = Game.getObjectById(roomObject.memory.task.attack);
            if (enemy != null) {
                if (enemy.hits == 0)
                    roomObject.memory.task.attack = null;
            }
            else
                roomObject.memory.task.attack = null;
        }
        if (roomObject.memory.task.attack == null) {
            let enemys = roomObject.find(FIND_HOSTILE_CREEPS);
            for (let e in enemys) {
                let enemy = enemys[e];
                if (enemy != null && enemy.hits == enemy.hitsMax) {
                    console.log('User ' + enemy.owner.username + ' spotted in room ' + room);
                    roomObject.memory.task.attack = enemy.id;
                    break;
                }
            }
        }
    }
};