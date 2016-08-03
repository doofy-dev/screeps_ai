/**
 * Created by teeebor on 2016-07-20.
 */
module.exports = {
    bodyPartCost: {
        move: 80,
        work: 100,
        carry: 50,
        attack: 80,
        ranged_attack: 150,
        heal: 250,
        claim: 600,
        tough: 10
    },
    jobs: {
        melee: {
            parts: [MOVE, ATTACK, TOUGH, CLAIM],
            initial: 1,  //initial number
            required: 1,  //when more required
            count: 0,
            priority: 5,  //how important it is
            tasks:[],
            spawnCondition: (room)=>room.memory.level > 2
        },
        ranged: {
            parts: [MOVE, RANGED_ATTACK, CLAIM],
            initial: 1,
            required: 1,
            count: 0,
            priority: 4,
            tasks:[],
            spawnCondition: (room)=>room.memory.level > 2
        },
        harvest: {
            parts: [MOVE, WORK, CARRY],
            initial: 2,
            required: 2,
            count: 0,
            priority: 1,
            tasks:['harvest','transfer_close','transfer','upgrade'],
            spawnCondition: (room)=>true
        },
        engineer: {
            parts: [MOVE, WORK, CARRY],
            initial: 2,
            required: 1,
            count: 0,
            priority: 3,
            tasks:['collect','harvest','repair','build','upgrade'],
            spawnCondition: (room)=>room.memory.level < 2
        },
        medic: {
            parts: [MOVE, HEAL],
            initial: 1,
            required: 1,
            count: 0,
            priority: 6,
            tasks:[],
            spawnCondition: (room)=>room.memory.level > 2
        },
        research: {
            parts: [MOVE, WORK, CARRY],
            initial: 1,
            required: 1,
            count: 0,
            priority: 2,
            tasks:['collect','harvest','upgrade'],
            spawnCondition: (room)=>true
        },
        merchant: {
            parts: [MOVE, CARRY],
            initial: 1,
            required: 1,
            count: 0,
            priority: 7,
            tasks:[],
            spawnCondition: (room)=>room.memory.level > 1
        },
        scout: {
            parts: [MOVE, TOUGH],
            initial: 1,
            required: 1,
            count: 0,
            priority: 8,
            tasks:[],
            spawnCondition: (room)=>room.memory.level == 2
        }
    },
    repair_condition: function(object){
        let structure = {
                other:(object)=>object.hits<object.hitsMax,
                constructedWall:(object)=>object.hits<10,
                controller:(object)=>false,
                spawn:(object)=>false
        };
        var s = (typeof structure[object.structureType] != "undefined"?object.type:'other');
        return object.my && structure[s]},
    // object.hits < object.hitsMax && object.structureType != STRUCTURE_WALL && object.structureType != TERRAIN_MASK_WALL && object.id!=object.room.controller,
    repair_done: (object)=>object.hits == object.hitsMax,
    update_frequency: 600,
    minimum_construction_site:3,
    place_construction_site:5,
    roomMemory: {
        task: {
            build: null,
            repair: null,
            attack: null
        },
        last_update: 0,
        level: 0,    // 0=>start, 1=>preparation, 2=>strong, 3=> war
        nearby_rooms: {
            TOP: null,
            RIGHT: null,
            BOTTOM: null,
            LEFT: null,
        },
        sources: {},
        creeps: {}
    },
    roomPhases: {
        0: (room)=>room.controller.my,
        1: (room)=>room.find(FIND_MY_CONSTRUCTION_SITES).length > 0,
        2: (room)=>room.controller.level >= 3 && room.energyCapacity > 500,
        3: (room)=>room.find(FIND_HOSTILE_CREEPS) > 0
    },
    minimumTimeToLive: 30,
    creep: {
        main_job: null,
        destination: {id: null, path: null, index: 0, action: null},
        need_collect: true,
        task:null,
        canDo: true,
        tasks:[]
    },
    flagColors: {
        defend: COLOR_BLUE,
        attack: COLOR_RED,
        move: COLOR_WHITE,
        resource_region:COLOR_YELLOW
    },
    direction: {
        1: {x: 0, y: 1}, //TOP
        2: {x: 1, y: 1}, //TOP-RIGHT
        3: {x: 1, y: 0}, //RIGHT
        4: {x: 1, y: -1},//BOTTOM-RIGHT
        5: {x: 0, y: -1}, //BOTTOM
        6: {x: -1, y: -1}, //BOTTOM-LEFT
        7: {x: -1, y: 0}, //LEFT
        8: {x: -1, y: 1} //TOP-LEFT
    },
    room_type: {
        ally: (room)=>room.controller.my == true,
        enemy: (room)=>(room.find(FIND_HOSTILE_STRUCTURES).length > 0 || room.find(FIND_HOSTILE_CREEPS)) && room.controller.my != true,
        empty: (room)=>room.controller.my != true && room.find(FIND_HOSTILE_STRUCTURES).length == 0
    }
};