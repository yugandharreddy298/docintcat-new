/**
 * Broadcast updates to client when the model changes
 */

'use strict';

var Stamp = require('./stamp.model');

exports.register = function(socket) {
  Stamp.schema.post('save', function (doc) {
    onSave(socket, doc);
  });
  Stamp.schema.post('remove', function (doc) {
    onRemove(socket, doc);
  });
}

function onSave(socket, doc, cb) {
  socket.emit('stamp:save', doc);
  // socket.broadcast.emit('stamp:save', doc);
}

function onRemove(socket, doc, cb) {
  socket.emit('stamp:remove', doc);
  // socket.broadcast.emit('stamp:remove', doc);
}