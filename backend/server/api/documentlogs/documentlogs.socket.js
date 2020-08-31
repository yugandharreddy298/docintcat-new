/**
 * Broadcast updates to client when the model changes
 */

'use strict';

var Documentlogs = require('./documentlogs.model');

exports.register = function(socket) {
  Documentlogs.schema.post('save', function (doc) {
    onSave(socket, doc);
  });
  Documentlogs.schema.post('remove', function (doc) {
    onRemove(socket, doc);
  });
}

function onSave(socket, doc, cb) {
  socket.emit('documentlogs:save', doc);
  // socket.broadcast.emit('documentlogs:save', doc);
}

function onRemove(socket, doc, cb) {
  socket.emit('documentlogs:remove', doc);
  // socket.broadcast.emit('documentlogs:remove', doc);
}