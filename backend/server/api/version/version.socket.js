/**
 * Broadcast updates to client when the model changes
 */

'use strict';

var Version = require('./version.model');

exports.register = function(socket) {
  Version.schema.post('save', function (doc) {
    onSave(socket, doc);
  });
  Version.schema.post('remove', function (doc) {
    onRemove(socket, doc);
  });
}

function onSave(socket, doc, cb) {
  socket.emit('version:save', doc);
  // socket.broadcast.emit('version:save', doc);
}

function onRemove(socket, doc, cb) {
  socket.emit('version:remove', doc);
  // socket.broadcast.emit('version:remove', doc);
}