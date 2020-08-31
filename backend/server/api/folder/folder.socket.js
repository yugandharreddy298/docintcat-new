/**
 * Broadcast updates to client when the model changes
 */

'use strict';

var Folder = require('./folder.model');

exports.register = function(socket) {
  Folder.schema.post('save', function (doc) {
    onSave(socket, doc);
  });
  Folder.schema.post('remove', function (doc) {
    onRemove(socket, doc);
  });
}

function onSave(socket, doc, cb) {
  socket.emit('folder:save', doc);
  // socket.broadcast.emit('folder:save', doc);
}

function onRemove(socket, doc, cb) {
  socket.emit('folder:remove', doc);
  // socket.broadcast.emit('folder:remove', doc);
}