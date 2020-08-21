/**
 * Socket Controller
 */
const debug = require('debug')('kill-the-virus:socket_controller');
let io = null;

module.exports = function (socket) {
	io = this;
	debug(`Client ${socket.id} connected!`);
};
