/**
 * Socket Controller
 */
const debug = require('debug')('kill-the-virus:socket_controller');

module.exports = function (socket) {
	debug(`Client ${socket.id} connected!`);
};
