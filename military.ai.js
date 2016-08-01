/**
 * Created by teeebor on 2016-07-23.
 */
var AI = require('ai');
function Military(creep) {
    this.base = AI;
    this.base(creep);
}
Military.prototype.constructor = Military;






module.exports = Military;