/**
 * Created by teeebor on 2016-07-14.
 */

module.exports = function (room) {
    var spawner = require("spawn");
    var roomObject = Game.rooms[room];
    if (typeof roomObject.memory.tasks == "undefined")
        roomObject.memory.tasks = {
            buildTask: null,
            repairTask: null,
            attackTarget: null,
            upgradeTask: null
        };
    if (typeof roomObject.memory.sources == "undefined") {
        roomObject.memory.sources = {};
        var sources = roomObject.find(FIND_SOURCES);
        for (let s in sources) {
            let source = sources[s];
            roomObject.memory.sources[source.id]={
                entries: getEntries(source),
                allocated: 0
            }
        }
    }
    if (typeof roomObject.memory.states == 'undefined' || roomObject.memory.states == null)
        roomObject.memory.states = {
            currentTarget: null,
            creeps: {
                melee: {
                    initial: 1,  //initial number
                    required: 1,  //when more required
                    count: 0,
                    priority: 5  //how important it is
                },
                ranged: {
                    initial: 1,
                    required: 1,
                    count: 0,
                    priority: 4
                },
                harvest: {
                    initial: 2,
                    required: 2,
                    count: 0,
                    priority: 1
                },
                engineer: {
                    initial: 2,
                    required: 1,
                    count: 0,
                    priority: 3
                },
                medic: {
                    initial: 1,
                    required: 1,
                    count: 0,
                    priority: 6
                },
                research: {
                    initial: 1,
                    required: 1,
                    count: 0,
                    priority: 2
                }
            }
        };

    checkBuildTask();
    checkRepair();
    findEnemy();
    attackTower();
    for (let c in roomObject.memory.states.creeps) {
        roomObject.memory.states.creeps[c].count = _.filter(Game.creeps, function (creep) {
            return creep.memory.mainJob == c && creep.ticksToLive > 30;
        }).length
    }
    // console.log(JSON.stringify( Memory.rooms[room].states));
    spawn();
    function spawn() {
        let spawns = roomObject.find(FIND_MY_SPAWNS);
        for (let s in spawns) {
            let sp = spawns[s];
            spawner(sp);
        }
    }


    function checkBuildTask() {
        if (roomObject.memory.tasks.buildTask != null) {
            var cs = Game.getObjectById(roomObject.memory.tasks.buildTask);
            if (cs != null) {
                if (cs.progress == cs.progressTotal)
                    roomObject.memory.tasks.buildTask = null;
            }
            else
                roomObject.memory.tasks.buildTask = null;
        }
        if (roomObject.memory.tasks.buildTask == null) {
            var sites = [];
            var constructionSites = roomObject.find(FIND_MY_CONSTRUCTION_SITES);
            for (let cs in constructionSites) {
                let constructionSite = constructionSites[cs];
                if (constructionSite != null && constructionSite.progress < constructionSite.progressTotal)
                    sites.push(constructionSite);
            }
            for(let i= 0; i<sites.length;i++){
                let pos = sites[i].pos;
                if(Game.map.getTerrainAt(pos.x, pos.y, room)=="swamp"){
                    roomObject.memory.tasks.buildTask = sites[i].id;
                }
            }if(roomObject.memory.tasks.buildTask==null && sites.length>0)
                roomObject.memory.tasks.buildTask = sites[0].id;
            // roomObject.memory.tasks.buildTask = constructionSite.id;
        }
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

    function checkRepair() {
        if (roomObject.memory.tasks.repairTask != null) {
            var cs = Game.getObjectById(roomObject.memory.tasks.repairTask);
            if (cs != null) {
                if (cs.hits == cs.hitsMax)
                    roomObject.memory.tasks.repairTask = null;
            }
            else
                roomObject.memory.tasks.repairTask = null;
        }
        if (roomObject.memory.tasks.repairTask == null) {
            var structures = roomObject.find(FIND_MY_STRUCTURES);
            for (let s in structures) {
                let structure = structures[s];
                if (structure != null && structure.hits < structure.hitsMax)
                    roomObject.memory.tasks.repairTask = structure.id;
            }
        }
    }

    function findEnemy() {
        if (roomObject.memory.tasks.attackTarget != null) {
            let enemy = Game.getObjectById(roomObject.memory.tasks.attackTarget);
            if (enemy != null) {
                if (enemy.hits == 0)
                    roomObject.memory.tasks.attackTarget = null;
            }
            else
                roomObject.memory.tasks.attackTarget = null;
        }
        if (roomObject.memory.tasks.attackTarget == null) {
            let enemys = roomObject.find(FIND_HOSTILE_CREEPS);
            for (let e in enemys) {
                let enemy = enemys[e];
                if (enemy != null && enemy.hits == enemy.hitsMax) {
                    console.log('User ' + enemy.owner.username + ' spotted in room ' + room);
                    roomObject.memory.tasks.attackTarget = enemy.id;
                    break;
                }
            }
        }
    }

    function attackTower() {
        if (roomObject.memory.tasks.attackTarget != null) {
            var towers = roomObject.find(
                FIND_MY_STRUCTURES, {filter: {structureType: STRUCTURE_TOWER}});
            towers.forEach(tower => tower.attack(roomObject.memory.tasks.attackTarget));
        }
    }
};