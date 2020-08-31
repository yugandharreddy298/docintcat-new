



/**
 * Socket.io configuration
 */

'use strict';

var config = require('./environment');

// When the user disconnects.. perform this
function onDisconnect(socket) {
  console.log("Disconnection process$$$$$$$")
  socket.disconnect();
}

// When the user connects.. perform this
function onConnect(socket) {
  // When the client emits 'info', this listens and executes
  socket.on('info', function (data) {
    console.info('[%s] %s', socket.address, JSON.stringify(data, null, 2));
  });

  //When the document is delete(active status is changed) 'Document:Delete' is emitted
  socket.on('Document:Delete', function (data) {
  socket.broadcast.emit('Document:Delete', data);
});

  socket.on('onDisconnect', function (data) {
    socket.disconnect();
  });
  require('../api/photo/photo.socket').register(socket);
  require('../api/stamp/stamp.socket').register(socket);
  require('../api/signature/signature.socket').register(socket);
  require('../api/mobilelink/mobilelink.socket').register(socket);
  require('../api/links/links.socket').register(socket);
  require('../api/department/department.socket').register(socket);
  require('../api/otp/otp.socket').register(socket);
  require('../api/folder/folder.socket').register(socket);
  require('../api/document/document.socket').register(socket);
  require('../api/sharingpeople/sharingpeople.socket').register(socket);
  require('../api/notification/notification.socket').register(socket);
  require('../api/chat/chat.socket').register(socket);
  require('../api/onlineuser/onlineuser.socket').register(socket);
  require('../api/comment/comment.socket').register(socket);
  require('../api/fieldvalue/fieldvalue.socket').register(socket);
  require('../api/fieldoption/fieldoption.socket').register(socket);
  require('../api/documentlogs/documentlogs.socket').register(socket);
  require('../api/user/user.socket').register(socket);
  require('../api/favorite/favorite.socket').register(socket);
}

module.exports = function (socketio) {
  // socket.io (v1.x.x) is powered by debug.
  // In order to see all the debug output, set DEBUG (in server/config/local.env.js) to including the desired scope.
  //
  // ex: DEBUG: "http*,socket.io:socket"

  // We can authenticate socket.io users and access their token through socket.handshake.decoded_token
  //
  // 1. You will need to send the token in `client/components/socket/socket.service.js`
  //
  // 2. Require authentication here:
  // socketio.use(require('socketio-jwt').authorize({
  //   secret: config.secrets.session,
  //   handshake: true
  // }));

  socketio.on('connection', function (socket) {
    socket.address = socket.handshake.address !== null ?
            socket.handshake.address.address + ':' + socket.handshake.address.port :
            process.env.DOMAIN;

    socket.connectedAt = new Date();
    // Call onDisconnect.
    socket.on('disconnect', function () {
      console.log("In Disconnect method*****")
      onDisconnect(socket);
      console.info('[%s] DISCONNECTED', socket.address);
    });
    

    // Call onConnect.
    onConnect(socket);
    console.info('[%s] CONNECTED', socket.address);
  });
};











