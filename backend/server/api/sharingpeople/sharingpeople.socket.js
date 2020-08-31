/**
 * Broadcast updates to client when the model changes
 */

'use strict';

var Sharingpeople = require('./sharingpeople.model');

exports.register = function(socket) {
  Sharingpeople.schema.post('save', function (doc) {
    onSave(socket, doc);
  });
  Sharingpeople.schema.post('remove', function (doc) {
    onRemove(socket, doc);
  });
}

function onSave(socket, doc, cb) {
   socket.emit('sharingpeople:save', doc);
  //  socket.broadcast.emit('sharingpeople:save', doc);
}

function onRemove(socket, doc, cb) {
  socket.emit('sharingpeople:remove', doc);
  // socket.broadcast.emit('sharingpeople:remove', doc);
}