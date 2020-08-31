/**
 * Broadcast updates to client when the model changes
 */

'use strict';

var Onlineuser = require('./onlineuser.model');

exports.register = function(socket) {
  Onlineuser.schema.post('save', function (doc) {
    onSave(socket, doc);
  });
  Onlineuser.schema.post('remove', function (doc) {
    onRemove(socket, doc);
  });
}

function onSave(socket, doc, cb) {
  socket.emit('onlineuser:save', doc);
  // socket.broadcast.emit('onlineuser:save', doc);
}

function onRemove(socket, doc, cb) {
  socket.emit('onlineuser:remove', doc);
  // socket.broadcast.emit('onlineuser:remove', doc);
}